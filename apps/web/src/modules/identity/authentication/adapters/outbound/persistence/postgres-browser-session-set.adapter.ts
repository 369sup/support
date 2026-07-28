import "server-only";

import { createHash } from "node:crypto";

import {
  runPostgresMigrations,
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type {
  AccountSessionSnapshot,
  BrowserSessionSetRepositoryPort,
  BrowserSessionSetSnapshot,
} from "../../../application/ports/outbound/browser-session-set.repository.port";
import type { AccountSessionRevocationPort } from "../../../application/ports/outbound/account-session-revocation.port";
import { postgresAuthenticationMigrations } from "./postgres-authentication.migrations";

type SessionSetRow = SqlRow & {
  active_session_id: string | null;
};

type AccountSessionRow = SqlRow & {
  account_id: string;
  authenticated_at: string;
  expires_at: string | null;
  session_id: string;
  status: AccountSessionSnapshot["status"];
};

function hashBrowserToken(browserToken: string): string {
  return createHash("sha256").update(browserToken).digest("hex");
}

function mapSession(row: AccountSessionRow): AccountSessionSnapshot {
  return {
    accountId: row.account_id,
    authenticatedAt: row.authenticated_at,
    expiresAt: row.expires_at,
    sessionId: row.session_id,
    status: row.status,
  };
}

export class PostgresBrowserSessionSetAdapter
  implements
    BrowserSessionSetRepositoryPort,
    AccountSessionRevocationPort
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

  async delete(browserToken: string): Promise<void> {
    await this.ready;
    await this.database.query(
      "delete from support_browser_session_sets where token_hash = $1",
      [hashBrowserToken(browserToken)],
    );
  }

  async findByToken(
    browserToken: string,
  ): Promise<BrowserSessionSetSnapshot | null> {
    await this.ready;
    const tokenHash = hashBrowserToken(browserToken);
    const [sessionSet, sessions] = await Promise.all([
      this.database.query<SessionSetRow>(
        `
          select active_session_id
          from support_browser_session_sets
          where token_hash = $1
        `,
        [tokenHash],
      ),
      this.database.query<AccountSessionRow>(
        `
          select
            account_id,
            authenticated_at::text as authenticated_at,
            expires_at::text as expires_at,
            session_id,
            status
          from support_account_sessions
          where token_hash = $1
          order by created_at, session_id
        `,
        [tokenHash],
      ),
    ]);
    const row = sessionSet.rows[0];
    return row === undefined
      ? null
      : {
          activeSessionId: row.active_session_id,
          browserToken,
          sessions: sessions.rows.map(mapSession),
        };
  }

  async save(sessionSet: BrowserSessionSetSnapshot): Promise<void> {
    await this.ready;
    const tokenHash = hashBrowserToken(sessionSet.browserToken);
    await this.database.transaction(async (connection) => {
      await connection.query(
        `
          insert into support_browser_session_sets (
            token_hash, active_session_id
          ) values ($1, $2)
          on conflict (token_hash) do update
          set active_session_id = excluded.active_session_id,
              updated_at = now()
        `,
        [tokenHash, sessionSet.activeSessionId],
      );
      await connection.query(
        "delete from support_account_sessions where token_hash = $1",
        [tokenHash],
      );
      for (const session of sessionSet.sessions) {
        await connection.query(
          `
            insert into support_account_sessions (
              session_id, token_hash, account_id, status,
              authenticated_at, expires_at, last_active_at
            ) values ($1, $2, $3, $4, $5, $6, $5)
          `,
          [
            session.sessionId,
            tokenHash,
            session.accountId,
            session.status,
            session.authenticatedAt,
            session.expiresAt,
          ],
        );
      }
    });
  }

  async revokeAccountSessions(accountId: string): Promise<void> {
    await this.ready;
    await this.database.transaction(async (connection) => {
      const affected = await connection.query<{
        token_hash: string;
      }>(
        `
          update support_account_sessions
          set status = 'revoked'
          where account_id = $1 and status <> 'revoked'
          returning token_hash
        `,
        [accountId],
      );
      const tokenHashes = [
        ...new Set(affected.rows.map((row) => row.token_hash)),
      ];
      for (const tokenHash of tokenHashes) {
        await connection.query(
          `
            update support_browser_session_sets
            set active_session_id = null, updated_at = now()
            where token_hash = $1
              and active_session_id in (
                select session_id
                from support_account_sessions
                where token_hash = $1 and account_id = $2
              )
          `,
          [tokenHash, accountId],
        );
      }
    });
  }
}
