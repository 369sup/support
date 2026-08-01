import "server-only";

import {
  assertPostgresMigrationsApplied,
  type SqlExecutor,
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { AccountEmailRepositoryPort } from "../../../application/ports/outbound/account-email.repository.port";
import type {
  AccountEmail,
  AccountEmailOwnership,
  EmailVerification,
  OrganizationNotificationRoute,
} from "../../../domain/account-email";
import { postgresAccountEmailMigrations } from "./postgres-account-email.migrations";

type AccountEmailRow = SqlRow & {
  account_id: string;
  address: string;
  created_at: string;
  email_id: string;
  isPrimary: boolean;
  isPublic: boolean;
  isVerified: boolean;
  ownership: AccountEmailOwnership;
};

type EmailVerificationRow = SqlRow & {
  email_id: string;
  expires_at: string;
  token_hash: string;
};

type CountRow = SqlRow & {
  count: string;
};

function mapEmail(row: AccountEmailRow): AccountEmail {
  return {
    accountId: row.account_id,
    address: row.address,
    createdAt: row.created_at,
    emailId: row.email_id,
    isPrimary: row.isPrimary,
    isPublic: row.isPublic,
    isVerified: row.isVerified,
    ownership: row.ownership,
  };
}

const emailColumns = `
  account_id,
  address,
  created_at::text as created_at,
  email_id,
  is_primary as "isPrimary",
  is_public as "isPublic",
  is_verified as "isVerified",
  ownership
`;

export class PostgresAccountEmailAdapter
  implements AccountEmailRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;
  private readonly ready: Promise<void>;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
    this.ready = assertPostgresMigrationsApplied(
      database,
      postgresAccountEmailMigrations,
    );
  }

  async add(email: AccountEmail): Promise<
    | Readonly<{ status: "added" }>
    | Readonly<{
        status:
          | "account-email-limit"
          | "email-already-owned"
          | "email-quarantined";
      }>
  > {
    await this.ready;
    return this.database.transaction(async (connection) => {
      const conflict = await this.findAddConflict(
        connection,
        email.accountId,
        email.address,
      );
      if (conflict !== null) {
        return { status: conflict };
      }
      const result = await connection.query(
        `
          insert into support_account_emails (
            email_id, account_id, address, ownership,
            is_primary, is_public, is_verified, created_at
          ) values ($1, $2, $3, $4, $5, $6, $7, $8)
          on conflict do nothing
        `,
        [
          email.emailId,
          email.accountId,
          email.address,
          email.ownership,
          email.isPrimary,
          email.isPublic,
          email.isVerified,
          email.createdAt,
        ],
      );
      return result.rowCount === 1
        ? { status: "added" }
        : { status: "email-already-owned" };
    });
  }

  async findByAddress(
    address: string,
  ): Promise<AccountEmail | null> {
    await this.ready;
    const result = await this.database.query<AccountEmailRow>(
      `
        select ${emailColumns}
        from support_account_emails
        where lower(address) = lower($1)
      `,
      [address],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapEmail(row);
  }

  async findById(emailId: string): Promise<AccountEmail | null> {
    await this.ready;
    const result = await this.database.query<AccountEmailRow>(
      `
        select ${emailColumns}
        from support_account_emails
        where email_id = $1
      `,
      [emailId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapEmail(row);
  }

  async findVerificationByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerification | null> {
    await this.ready;
    const result = await this.database.query<EmailVerificationRow>(
      `
        select
          email_id,
          expires_at::text as expires_at,
          token_hash
        from support_email_verifications
        where token_hash = $1 and consumed_at is null
      `,
      [tokenHash],
    );
    const row = result.rows[0];
    return row === undefined
      ? null
      : {
          emailId: row.email_id,
          expiresAt: row.expires_at,
          tokenHash: row.token_hash,
        };
  }

  async listByAccount(
    accountId: string,
  ): Promise<readonly AccountEmail[]> {
    await this.ready;
    const result = await this.database.query<AccountEmailRow>(
      `
        select ${emailColumns}
        from support_account_emails
        where account_id = $1
        order by created_at, email_id
      `,
      [accountId],
    );
    return result.rows.map(mapEmail);
  }

  async remove(
    emailId: string,
    quarantineUntil: string,
  ): Promise<boolean> {
    await this.ready;
    return this.database.transaction(async (connection) => {
      const email = await connection.query<AccountEmailRow>(
        `
          select ${emailColumns}
          from support_account_emails
          where email_id = $1 and is_primary = false
          for update
        `,
        [emailId],
      );
      const row = email.rows[0];
      if (row === undefined) {
        return false;
      }
      await connection.query(
        `
          insert into support_released_account_emails (
            address, quarantine_until
          ) values ($1, $2)
          on conflict (address) do update
          set quarantine_until = excluded.quarantine_until,
              released_at = now()
        `,
        [row.address, quarantineUntil],
      );
      await connection.query(
        "delete from support_account_emails where email_id = $1",
        [emailId],
      );
      return true;
    });
  }

  async saveOrganizationNotificationRoute(
    route: OrganizationNotificationRoute,
  ): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        insert into support_organization_notification_routes (
          organization_id, account_id, email_id, updated_at
        ) values ($1, $2, $3, $4)
        on conflict (organization_id, account_id) do update
        set email_id = excluded.email_id,
            updated_at = excluded.updated_at
      `,
      [
        route.organizationId,
        route.accountId,
        route.emailId,
        route.updatedAt,
      ],
    );
  }

  async saveVerification(
    verification: EmailVerification,
  ): Promise<void> {
    await this.ready;
    await this.database.transaction(async (connection) => {
      await connection.query(
        `
          delete from support_email_verifications
          where email_id = $1 and consumed_at is null
        `,
        [verification.emailId],
      );
      await connection.query(
        `
          insert into support_email_verifications (
            token_hash, email_id, expires_at
          ) values ($1, $2, $3)
        `,
        [
          verification.tokenHash,
          verification.emailId,
          verification.expiresAt,
        ],
      );
    });
  }

  async setPrimary(
    accountId: string,
    emailId: string,
  ): Promise<boolean> {
    await this.ready;
    return this.database.transaction(async (connection) => {
      const selected = await connection.query(
        `
          select email_id
          from support_account_emails
          where account_id = $1
            and email_id = $2
            and is_verified = true
          for update
        `,
        [accountId, emailId],
      );
      if (selected.rowCount !== 1) {
        return false;
      }
      await connection.query(
        `
          update support_account_emails
          set is_primary = (email_id = $2)
          where account_id = $1
        `,
        [accountId, emailId],
      );
      return true;
    });
  }

  async setPublic(
    accountId: string,
    emailId: string | null,
  ): Promise<boolean> {
    await this.ready;
    if (emailId !== null) {
      const selected = await this.database.query(
        `
          select email_id
          from support_account_emails
          where account_id = $1
            and email_id = $2
            and is_verified = true
        `,
        [accountId, emailId],
      );
      if (selected.rowCount !== 1) {
        return false;
      }
    }
    await this.database.query(
      `
        update support_account_emails
        set is_public = (email_id = $2)
        where account_id = $1
      `,
      [accountId, emailId],
    );
    return true;
  }

  async verify(emailId: string, tokenHash: string): Promise<boolean> {
    await this.ready;
    return this.database.transaction(async (connection) => {
      const token = await connection.query(
        `
          update support_email_verifications
          set consumed_at = now()
          where token_hash = $1
            and email_id = $2
            and consumed_at is null
            and expires_at > now()
        `,
        [tokenHash, emailId],
      );
      if (token.rowCount !== 1) {
        return false;
      }
      const email = await connection.query(
        `
          update support_account_emails
          set is_verified = true
          where email_id = $1
        `,
        [emailId],
      );
      return email.rowCount === 1;
    });
  }

  private async findAddConflict(
    connection: SqlExecutor,
    accountId: string,
    address: string,
  ): Promise<
    | "account-email-limit"
    | "email-already-owned"
    | "email-quarantined"
    | null
  > {
    const [owner, quarantine, count] = await Promise.all([
      connection.query<CountRow>(
        `
          select count(*)::text as count
          from support_account_emails
          where lower(address) = lower($1)
        `,
        [address],
      ),
      connection.query<CountRow>(
        `
          select count(*)::text as count
          from support_released_account_emails
          where lower(address) = lower($1)
            and quarantine_until > now()
        `,
        [address],
      ),
      connection.query<CountRow>(
        `
          select count(*)::text as count
          from support_account_emails
          where account_id = $1
        `,
        [accountId],
      ),
    ]);
    if (Number(owner.rows[0]?.count ?? "0") > 0) {
      return "email-already-owned";
    }
    if (Number(quarantine.rows[0]?.count ?? "0") > 0) {
      return "email-quarantined";
    }
    return Number(count.rows[0]?.count ?? "0") >= 10
      ? "account-email-limit"
      : null;
  }
}
