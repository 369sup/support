import type {
  PostgresDatabase,
  SqlRow,
} from "@support/database/postgres";

import type {
  ExternalIdentityAccount,
  ExternalIdentityRepositoryPort,
} from "../../../application/ports/outbound/external-identity.repository.port";

type ExternalIdentityRow = SqlRow &
  Readonly<{
    account_id: string;
    account_type: "managed" | "personal";
    display_name: string;
    email: string;
    lifecycle_state: "active" | "deleted" | "suspended";
    provider: "supabase";
    subject: string;
    usage: "human" | "machine";
    username: string;
  }>;

function mapIdentity(row: ExternalIdentityRow): ExternalIdentityAccount {
  return {
    account: {
      accountId: row.account_id,
      accountType: row.account_type,
      displayName: row.display_name,
      lifecycleState: row.lifecycle_state,
      usage: row.usage,
      username: row.username,
    },
    email: row.email,
    provider: row.provider,
    subject: row.subject,
  };
}

export class PostgresExternalIdentityAdapter
  implements ExternalIdentityRepositoryPort
{
  private readonly database: PostgresDatabase;

  constructor(database: PostgresDatabase) {
    this.database = database;
  }

  async isReady(): Promise<boolean> {
    try {
      await this.database.query(
        `select 1
           from support_identity_authentication.support_auth_identities
          limit 0`,
      );
      return true;
    } catch {
      return false;
    }
  }

  async isExternalOnboardingReady(): Promise<boolean> {
    return this.isReady();
  }

  async findBySubject(
    provider: "supabase",
    subject: string,
  ): Promise<ExternalIdentityAccount | null> {
    const result = await this.database.query<ExternalIdentityRow>(
      `
        select
          identity.provider,
          identity.subject,
          identity.email,
          account.account_id,
          account.username,
          account.display_name,
          account.account_type,
          account.usage,
          account.lifecycle_state
        from support_identity_authentication.support_auth_identities as identity
        inner join support_identity_accounts.support_accounts as account
          on account.account_id = identity.account_id
        where identity.provider = $1
          and identity.subject = $2
          and identity.email_verified_at is not null
          and account.lifecycle_state in ('active', 'suspended', 'deleted')
      `,
      [provider, subject],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapIdentity(row);
  }

  async findVerifiedEmailByUsername(
    username: string,
  ): Promise<string | null> {
    const result = await this.database.query<
      SqlRow & Readonly<{ email: string }>
    >(
      `
        select identity.email
        from support_identity_accounts.support_accounts as account
        inner join support_identity_authentication.support_auth_identities as identity
          on identity.account_id = account.account_id
          and identity.provider = 'supabase'
        where account.normalized_username = $1
          and account.lifecycle_state = 'active'
          and identity.email_verified_at is not null
      `,
      [username.trim().toLocaleLowerCase("en-US")],
    );
    return result.rows[0]?.email ?? null;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const result = await this.database.query<
      SqlRow & Readonly<{ isAvailable: boolean }>
    >(
      `
        select not exists (
          select 1
          from support_identity_accounts.support_accounts
          where normalized_username = $1
        ) as "isAvailable"
      `,
      [username.trim().toLocaleLowerCase("en-US")],
    );
    return result.rows[0]?.isAvailable === true;
  }
}
