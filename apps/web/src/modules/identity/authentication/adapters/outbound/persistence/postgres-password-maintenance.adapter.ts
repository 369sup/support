import "server-only";

import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import {
  runPostgresMigrations,
  type SqlExecutor,
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type {
  PasswordMaintenanceRepositoryPort,
  PasswordMaintenanceResult,
} from "../../../application/ports/outbound/password-maintenance.repository.port";
import { postgresAuthenticationMigrations } from "./postgres-authentication.migrations";

type CredentialRow = SqlRow & {
  account_id: string;
  verifier_digest: string;
  verifier_salt: string;
};

type PasswordHistoryRow = SqlRow & {
  verifier_digest: string;
  verifier_salt: string;
};

type PasswordResetRow = SqlRow & {
  account_id: string;
  consumed_at: string | null;
  expires_at: string;
};

type PasswordVerifier = Readonly<{
  digest: string;
  salt: string;
}>;

function createVerifier(password: string): PasswordVerifier {
  const salt = randomBytes(16);
  return {
    digest: scryptSync(password, salt, 64).toString("hex"),
    salt: salt.toString("hex"),
  };
}

function matchesVerifier(
  password: string,
  verifier: PasswordHistoryRow,
): boolean {
  const expected = Buffer.from(verifier.verifier_digest, "hex");
  const actual = scryptSync(
    password,
    Buffer.from(verifier.verifier_salt, "hex"),
    expected.length,
  );
  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

export class PostgresPasswordMaintenanceAdapter
  implements PasswordMaintenanceRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;
  private readonly ready: Promise<void>;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
    this.ready = runPostgresMigrations(
      database,
      postgresAuthenticationMigrations,
    );
  }

  async changePassword(input: {
    accountId: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<PasswordMaintenanceResult> {
    await this.ready;
    return this.database.transaction(async (connection) => {
      const credential = await this.findCredentialForUpdate(
        connection,
        input.accountId,
      );
      if (credential === null) {
        return { status: "credential-not-found" };
      }
      if (!matchesVerifier(input.currentPassword, credential)) {
        return { status: "invalid-current-password" };
      }
      if (
        await this.isPasswordReused(
          connection,
          input.accountId,
          input.newPassword,
          credential,
        )
      ) {
        return { status: "password-reused" };
      }
      await this.rotatePassword(
        connection,
        input.accountId,
        input.newPassword,
        credential,
      );
      return { status: "changed", accountId: input.accountId };
    });
  }

  async issueResetToken(input: {
    accountId: string;
    expiresAt: string;
    tokenHash: string;
  }): Promise<void> {
    await this.ready;
    await this.database.transaction(async (connection) => {
      await connection.query(
        `
          delete from support_password_reset_tokens
          where account_id = $1 and consumed_at is null
        `,
        [input.accountId],
      );
      await connection.query(
        `
          insert into support_password_reset_tokens (
            token_hash, account_id, expires_at
          ) values ($1, $2, $3)
        `,
        [input.tokenHash, input.accountId, input.expiresAt],
      );
    });
  }

  async resetPassword(input: {
    newPassword: string;
    tokenHash: string;
  }): Promise<PasswordMaintenanceResult> {
    await this.ready;
    return this.database.transaction(async (connection) => {
      const token = await connection.query<PasswordResetRow>(
        `
          select
            account_id,
            consumed_at::text as consumed_at,
            expires_at::text as expires_at
          from support_password_reset_tokens
          where token_hash = $1
          for update
        `,
        [input.tokenHash],
      );
      const reset = token.rows[0];
      if (reset === undefined || reset.consumed_at !== null) {
        return { status: "invalid-reset-token" };
      }
      if (Date.parse(reset.expires_at) <= Date.now()) {
        return { status: "reset-token-expired" };
      }
      const credential = await this.findCredentialForUpdate(
        connection,
        reset.account_id,
      );
      if (credential === null) {
        return { status: "invalid-reset-token" };
      }
      if (
        await this.isPasswordReused(
          connection,
          reset.account_id,
          input.newPassword,
          credential,
        )
      ) {
        return { status: "password-reused" };
      }
      await this.rotatePassword(
        connection,
        reset.account_id,
        input.newPassword,
        credential,
      );
      await connection.query(
        `
          update support_password_reset_tokens
          set consumed_at = now()
          where token_hash = $1
        `,
        [input.tokenHash],
      );
      return { status: "reset", accountId: reset.account_id };
    });
  }

  private async findCredentialForUpdate(
    connection: SqlExecutor,
    accountId: string,
  ): Promise<CredentialRow | null> {
    const result = await connection.query<CredentialRow>(
      `
        select account_id, verifier_digest, verifier_salt
        from support_password_credentials
        where account_id = $1
        for update
      `,
      [accountId],
    );
    return result.rows[0] ?? null;
  }

  private async isPasswordReused(
    connection: SqlExecutor,
    accountId: string,
    password: string,
    current: CredentialRow,
  ): Promise<boolean> {
    if (matchesVerifier(password, current)) {
      return true;
    }
    const history = await connection.query<PasswordHistoryRow>(
      `
        select verifier_digest, verifier_salt
        from support_password_history
        where account_id = $1
        order by created_at desc, history_id desc
        limit 5
      `,
      [accountId],
    );
    return history.rows.some((verifier) =>
      matchesVerifier(password, verifier),
    );
  }

  private async rotatePassword(
    connection: SqlExecutor,
    accountId: string,
    password: string,
    previous: CredentialRow,
  ): Promise<void> {
    const next = createVerifier(password);
    await connection.query(
      `
        insert into support_password_history (
          account_id, verifier_salt, verifier_digest
        ) values ($1, $2, $3)
      `,
      [
        accountId,
        previous.verifier_salt,
        previous.verifier_digest,
      ],
    );
    await connection.query(
      `
        update support_password_credentials
        set verifier_salt = $2,
            verifier_digest = $3,
            is_locked = false,
            updated_at = now()
        where account_id = $1
      `,
      [accountId, next.salt, next.digest],
    );
    await connection.query(
      `
        delete from support_password_history
        where account_id = $1
          and history_id not in (
            select history_id
            from support_password_history
            where account_id = $1
            order by created_at desc, history_id desc
            limit 5
          )
      `,
      [accountId],
    );
  }
}
