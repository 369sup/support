import { describe, expect, it } from "vitest";

import { CreateDevelopmentSessionHandler } from "../application/commands/create-development-session.handler";
import { ExpireSessionHandler } from "../application/commands/expire-session.handler";
import { ReauthenticateSessionHandler } from "../application/commands/reauthenticate-session.handler";
import { SwitchActiveAccountSessionHandler } from "../application/commands/switch-active-account-session.handler";
import { GetCurrentAuthenticatedSessionHandler } from "../application/queries/get-current-authenticated-session.handler";
import { ListBrowserAccountSessionsHandler } from "../application/queries/list-browser-account-sessions.handler";
import type {
  AccountReferenceGatewayPort,
  AuthenticationAccountSnapshot,
} from "../application/ports/outbound/account-reference.gateway.port";
import type {
  BrowserSessionSetRepositoryPort,
  BrowserSessionSetSnapshot,
} from "../application/ports/outbound/browser-session-set.repository.port";
import type { DevelopmentCredentialRepositoryPort } from "../application/ports/outbound/development-credential.repository.port";
import type { SessionRuntimeGatewayPort } from "../application/ports/outbound/session-runtime.gateway.port";

class SessionRepositoryFake implements BrowserSessionSetRepositoryPort {
  readonly sets = new Map<string, BrowserSessionSetSnapshot>();
  delete(browserToken: string) {
    this.sets.delete(browserToken);
    return Promise.resolve();
  }
  findByToken(browserToken: string) {
    return Promise.resolve(this.sets.get(browserToken) ?? null);
  }
  save(sessionSet: BrowserSessionSetSnapshot) {
    this.sets.set(sessionSet.browserToken, sessionSet);
    return Promise.resolve();
  }
}

class RuntimeFake implements SessionRuntimeGatewayPort {
  private id = 0;
  createOpaqueId() {
    this.id += 1;
    return `opaque-${this.id}`;
  }
  now() {
    return new Date("2026-07-23T00:00:00.000Z");
  }
}

const accounts: readonly AuthenticationAccountSnapshot[] = [
  {
    accountId: "account_octocat",
    username: "octocat",
    displayName: "The Octocat",
    accountType: "personal",
    usage: "human",
    lifecycleState: "active",
  },
  {
    accountId: "account_carol",
    username: "carol_ACME",
    displayName: "Carol",
    accountType: "managed",
    usage: "human",
    lifecycleState: "active",
  },
];

const accountGateway: AccountReferenceGatewayPort = {
  getAccountReference: (accountId) =>
    Promise.resolve(
      accounts.find((account) => account.accountId === accountId) ?? null,
    ),
};
const credentialRepository: DevelopmentCredentialRepositoryPort = {
  authenticate: (username, password) =>
    Promise.resolve(
      password === "github"
        ? (accounts.find((account) => account.username === username)
            ?.accountId ?? null)
        : null,
    ),
  authenticateAccount: (_accountId, password) =>
    Promise.resolve(password === "github"),
};

describe("browser account session switching", () => {
  it("does not switch to an expired managed session until reauthenticated", async () => {
    const repository = new SessionRepositoryFake();
    const runtime = new RuntimeFake();
    const create = new CreateDevelopmentSessionHandler(
      repository,
      credentialRepository,
      accountGateway,
      runtime,
    );
    const first = await create.createDevelopmentSession({
      browserToken: null,
      username: "octocat",
      password: "github",
    });
    expect(first.status).toBe("created");
    if (first.status !== "created") {
      return;
    }

    const second = await create.createDevelopmentSession({
      browserToken: first.browserToken,
      username: "carol_ACME",
      password: "github",
    });
    expect(second.status).toBe("created");
    if (second.status !== "created") {
      return;
    }

    const switchSession = new SwitchActiveAccountSessionHandler(
      repository,
      accountGateway,
      runtime,
    );
    await expect(
      switchSession.switchActiveAccountSession({
        browserToken: first.browserToken,
        sessionId: first.session.sessionId,
      }),
    ).resolves.toMatchObject({ status: "switched" });

    const expire = new ExpireSessionHandler(repository);
    await expire.expireSession({
      browserToken: first.browserToken,
      sessionId: second.session.sessionId,
    });
    await expect(
      switchSession.switchActiveAccountSession({
        browserToken: first.browserToken,
        sessionId: second.session.sessionId,
      }),
    ).resolves.toMatchObject({
      status: "reauthentication-required",
      sessionId: second.session.sessionId,
    });

    const current = new GetCurrentAuthenticatedSessionHandler(
      repository,
      accountGateway,
      runtime,
    );
    await expect(
      current.getCurrentAuthenticatedSession({
        browserToken: first.browserToken,
      }),
    ).resolves.toMatchObject({
      status: "authenticated",
      session: { account: { username: "octocat" } },
    });

    const reauthenticate = new ReauthenticateSessionHandler(
      repository,
      credentialRepository,
      accountGateway,
      runtime,
    );
    await reauthenticate.reauthenticateSession({
      browserToken: first.browserToken,
      sessionId: second.session.sessionId,
      password: "github",
    });
    await expect(
      switchSession.switchActiveAccountSession({
        browserToken: first.browserToken,
        sessionId: second.session.sessionId,
      }),
    ).resolves.toMatchObject({
      status: "switched",
      session: { account: { username: "carol_ACME" } },
    });
  });

  it("presents a naturally expired managed session as requiring reauthentication", async () => {
    const repository = new SessionRepositoryFake();
    const runtime = new RuntimeFake();
    repository.sets.set("browser-token", {
      browserToken: "browser-token",
      activeSessionId: "session-octocat",
      sessions: [
        {
          sessionId: "session-octocat",
          accountId: "account_octocat",
          status: "active",
          authenticatedAt: "2026-07-22T00:00:00.000Z",
          expiresAt: null,
        },
        {
          sessionId: "session-carol",
          accountId: "account_carol",
          status: "active",
          authenticatedAt: "2026-07-22T00:00:00.000Z",
          expiresAt: "2026-07-22T08:00:00.000Z",
        },
      ],
    });

    const list = new ListBrowserAccountSessionsHandler(
      repository,
      accountGateway,
      runtime,
    );
    await expect(
      list.listBrowserAccountSessions({ browserToken: "browser-token" }),
    ).resolves.toMatchObject({
      status: "found",
      sessions: [
        { sessionId: "session-octocat", status: "active", isCurrent: true },
        { sessionId: "session-carol", status: "expired", isCurrent: false },
      ],
    });
  });
});
