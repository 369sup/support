import "server-only";

import {
  runPostgresMigrations,
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { AccountSecurityRepositoryPort } from "../../../application/ports/outbound/account-security.repository.port";
import type {
  AuthenticationChallenge,
  PasskeyCredential,
  TwoFactorConfiguration,
  TwoFactorRecoveryRequest,
} from "../../../domain/account-security";
import { postgresAuthenticationMigrations } from "./postgres-authentication.migrations";

type ConfigurationRow = SqlRow & {
  account_id: string;
  isEnabled: boolean;
  last_totp_counter: string | null;
  pending_totp_secret: string | null;
  sudo_until: string | null;
  totp_secret: string | null;
};

type ChallengeRow = SqlRow & {
  account_id: string;
  challenge: string;
  challenge_id: string;
  expires_at: string;
  kind: AuthenticationChallenge["kind"];
};

type PasskeyRow = SqlRow & {
  account_id: string;
  counter: string;
  credential_id: string;
  device_type: string;
  isBackedUp: boolean;
  public_key: Buffer;
  transports: string[];
  webauthn_user_id: string;
};

type RecoveryRequestRow = SqlRow & {
  account_id: string;
  available_at: string;
  completed_at: string | null;
  request_id: string;
  requested_at: string;
};

function mapConfiguration(
  row: ConfigurationRow,
): TwoFactorConfiguration {
  return {
    accountId: row.account_id,
    isEnabled: row.isEnabled,
    lastTotpCounter:
      row.last_totp_counter === null
        ? null
        : Number(row.last_totp_counter),
    pendingTotpSecret: row.pending_totp_secret,
    sudoUntil: row.sudo_until,
    totpSecret: row.totp_secret,
  };
}

function mapChallenge(row: ChallengeRow): AuthenticationChallenge {
  return {
    accountId: row.account_id,
    challenge: row.challenge,
    challengeId: row.challenge_id,
    expiresAt: row.expires_at,
    kind: row.kind,
  };
}

function mapPasskey(row: PasskeyRow): PasskeyCredential {
  return {
    accountId: row.account_id,
    isBackedUp: row.isBackedUp,
    counter: Number(row.counter),
    credentialId: row.credential_id,
    deviceType: row.device_type,
    publicKey: new Uint8Array(row.public_key),
    transports: row.transports,
    webauthnUserId: row.webauthn_user_id,
  };
}

function mapRecoveryRequest(
  row: RecoveryRequestRow,
): TwoFactorRecoveryRequest {
  return {
    accountId: row.account_id,
    availableAt: row.available_at,
    completedAt: row.completed_at,
    requestId: row.request_id,
    requestedAt: row.requested_at,
  };
}

const configurationColumns = `
  account_id,
  is_enabled as "isEnabled",
  last_totp_counter::text as last_totp_counter,
  pending_totp_secret,
  sudo_until::text as sudo_until,
  totp_secret
`;

const challengeColumns = `
  account_id,
  challenge,
  challenge_id,
  expires_at::text as expires_at,
  kind
`;

const passkeyColumns = `
  account_id,
  counter::text as counter,
  credential_id,
  device_type,
  is_backed_up as "isBackedUp",
  public_key,
  transports,
  webauthn_user_id
`;

export class PostgresAccountSecurityAdapter
  implements AccountSecurityRepositoryPort
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

  async beginTotpEnrollment(
    accountId: string,
    protectedSecret: string,
  ): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        insert into support_two_factor_configurations (
          account_id, pending_totp_secret
        ) values ($1, $2)
        on conflict (account_id) do update
        set pending_totp_secret = excluded.pending_totp_secret,
            updated_at = now()
      `,
      [accountId, protectedSecret],
    );
  }

  async completeTwoFactorRecovery(
    requestId: string,
    completedAt: string,
  ): Promise<boolean> {
    await this.ready;
    const result = await this.database.query(
      `
        update support_two_factor_recovery_requests
        set completed_at = $2
        where request_id = $1
          and completed_at is null
          and cancelled_at is null
          and available_at <= $2
      `,
      [requestId, completedAt],
    );
    return result.rowCount === 1;
  }

  async consumeChallenge(
    challengeId: string,
    consumedAt: string,
  ): Promise<AuthenticationChallenge | null> {
    await this.ready;
    const result = await this.database.query<ChallengeRow>(
      `
        update support_authentication_challenges
        set consumed_at = $2
        where challenge_id = $1 and consumed_at is null
        returning ${challengeColumns}
      `,
      [challengeId, consumedAt],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapChallenge(row);
  }

  async consumeRecoveryCode(
    accountId: string,
    codeHash: string,
    consumedAt: string,
  ): Promise<boolean> {
    await this.ready;
    const result = await this.database.query(
      `
        update support_recovery_codes
        set consumed_at = $3
        where account_id = $1
          and code_hash = $2
          and consumed_at is null
      `,
      [accountId, codeHash, consumedAt],
    );
    return result.rowCount === 1;
  }

  async createTwoFactorRecoveryRequest(
    request: TwoFactorRecoveryRequest,
  ): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        insert into support_two_factor_recovery_requests (
          request_id, account_id, requested_at, available_at
        ) values ($1, $2, $3, $4)
      `,
      [
        request.requestId,
        request.accountId,
        request.requestedAt,
        request.availableAt,
      ],
    );
  }

  async disableTwoFactor(accountId: string): Promise<void> {
    await this.ready;
    await this.database.transaction(async (connection) => {
      await connection.query(
        `
          update support_two_factor_configurations
          set is_enabled = false,
              totp_secret = null,
              pending_totp_secret = null,
              last_totp_counter = null,
              sudo_until = null,
              updated_at = now()
          where account_id = $1
        `,
        [accountId],
      );
      await connection.query(
        "delete from support_recovery_codes where account_id = $1",
        [accountId],
      );
    });
  }

  async enableTotp(
    accountId: string,
    lastTotpCounter: number,
  ): Promise<boolean> {
    await this.ready;
    const result = await this.database.query(
      `
        update support_two_factor_configurations
        set is_enabled = true,
            totp_secret = pending_totp_secret,
            pending_totp_secret = null,
            last_totp_counter = $2,
            updated_at = now()
        where account_id = $1
          and pending_totp_secret is not null
          and (
            last_totp_counter is null or last_totp_counter < $2
          )
      `,
      [accountId, lastTotpCounter],
    );
    return result.rowCount === 1;
  }

  async findChallenge(
    challengeId: string,
  ): Promise<AuthenticationChallenge | null> {
    await this.ready;
    const result = await this.database.query<ChallengeRow>(
      `
        select ${challengeColumns}
        from support_authentication_challenges
        where challenge_id = $1 and consumed_at is null
      `,
      [challengeId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapChallenge(row);
  }

  async findPasskey(
    credentialId: string,
  ): Promise<PasskeyCredential | null> {
    await this.ready;
    const result = await this.database.query<PasskeyRow>(
      `
        select ${passkeyColumns}
        from support_passkeys
        where credential_id = $1
      `,
      [credentialId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapPasskey(row);
  }

  async findTwoFactorConfiguration(
    accountId: string,
  ): Promise<TwoFactorConfiguration | null> {
    await this.ready;
    const result = await this.database.query<ConfigurationRow>(
      `
        select ${configurationColumns}
        from support_two_factor_configurations
        where account_id = $1
      `,
      [accountId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapConfiguration(row);
  }

  async findTwoFactorRecoveryRequest(
    requestId: string,
  ): Promise<TwoFactorRecoveryRequest | null> {
    await this.ready;
    const result = await this.database.query<RecoveryRequestRow>(
      `
        select
          account_id,
          available_at::text as available_at,
          completed_at::text as completed_at,
          request_id,
          requested_at::text as requested_at
        from support_two_factor_recovery_requests
        where request_id = $1 and cancelled_at is null
      `,
      [requestId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapRecoveryRequest(row);
  }

  async listPasskeys(
    accountId: string,
  ): Promise<readonly PasskeyCredential[]> {
    await this.ready;
    const result = await this.database.query<PasskeyRow>(
      `
        select ${passkeyColumns}
        from support_passkeys
        where account_id = $1
        order by created_at, credential_id
      `,
      [accountId],
    );
    return result.rows.map(mapPasskey);
  }

  async replaceRecoveryCodes(
    accountId: string,
    codeHashes: readonly string[],
  ): Promise<void> {
    await this.ready;
    await this.database.transaction(async (connection) => {
      await connection.query(
        "delete from support_recovery_codes where account_id = $1",
        [accountId],
      );
      for (const codeHash of codeHashes) {
        await connection.query(
          `
            insert into support_recovery_codes (account_id, code_hash)
            values ($1, $2)
          `,
          [accountId, codeHash],
        );
      }
    });
  }

  async saveChallenge(
    challenge: AuthenticationChallenge,
  ): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        insert into support_authentication_challenges (
          challenge_id, account_id, kind, challenge, expires_at
        ) values ($1, $2, $3, $4, $5)
      `,
      [
        challenge.challengeId,
        challenge.accountId,
        challenge.kind,
        challenge.challenge,
        challenge.expiresAt,
      ],
    );
  }

  async savePasskey(passkey: PasskeyCredential): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        insert into support_passkeys (
          credential_id, account_id, public_key, webauthn_user_id,
          counter, device_type, is_backed_up, transports
        ) values ($1, $2, $3, $4, $5, $6, $7, $8)
        on conflict (credential_id) do nothing
      `,
      [
        passkey.credentialId,
        passkey.accountId,
        Buffer.from(passkey.publicKey),
        passkey.webauthnUserId,
        passkey.counter,
        passkey.deviceType,
        passkey.isBackedUp,
        `{${passkey.transports.join(",")}}`,
      ],
    );
  }

  async setSudoUntil(
    accountId: string,
    sudoUntil: string,
  ): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        update support_two_factor_configurations
        set sudo_until = $2, updated_at = now()
        where account_id = $1
      `,
      [accountId, sudoUntil],
    );
  }

  async updatePasskeyCounter(
    credentialId: string,
    counter: number,
    usedAt: string,
  ): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        update support_passkeys
        set counter = $2, last_used_at = $3
        where credential_id = $1 and counter <= $2
      `,
      [credentialId, counter, usedAt],
    );
  }

  async updateTotpCounter(
    accountId: string,
    expectedPreviousCounter: number | null,
    counter: number,
  ): Promise<boolean> {
    await this.ready;
    const result = await this.database.query(
      `
        update support_two_factor_configurations
        set last_totp_counter = $3, updated_at = now()
        where account_id = $1
          and last_totp_counter is not distinct from $2
          and (last_totp_counter is null or last_totp_counter < $3)
      `,
      [accountId, expectedPreviousCounter, counter],
    );
    return result.rowCount === 1;
  }
}
