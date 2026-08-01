import type {
  ReauthenticateSessionCommand,
  ReauthenticateSessionResult,
  ReauthenticateSessionUseCase,
} from "../ports/inbound/reauthenticate-session.use-case";
import type { AccountReferenceGatewayPort } from "../ports/outbound/account-reference.gateway.port";
import type { BrowserSessionSetRepositoryPort } from "../ports/outbound/browser-session-set.repository.port";
import type { DevelopmentCredentialRepositoryPort } from "../ports/outbound/development-credential.repository.port";
import type { SessionRuntimeGatewayPort } from "../ports/outbound/session-runtime.gateway.port";

export class ReauthenticateSessionHandler
  implements ReauthenticateSessionUseCase
{
  private readonly sessionRepository: BrowserSessionSetRepositoryPort;
  private readonly credentialRepository: DevelopmentCredentialRepositoryPort;
  private readonly accountGateway: AccountReferenceGatewayPort;
  private readonly runtime: SessionRuntimeGatewayPort;

  constructor(
    sessionRepository: BrowserSessionSetRepositoryPort,
    credentialRepository: DevelopmentCredentialRepositoryPort,
    accountGateway: AccountReferenceGatewayPort,
    runtime: SessionRuntimeGatewayPort,
  ) {
    this.sessionRepository = sessionRepository;
    this.credentialRepository = credentialRepository;
    this.accountGateway = accountGateway;
    this.runtime = runtime;
  }

  async reauthenticateSession(
    command: ReauthenticateSessionCommand,
  ): Promise<ReauthenticateSessionResult> {
    const sessionSet = await this.sessionRepository.findByToken(
      command.browserToken,
    );
    if (sessionSet === null) {
      return { status: "browser-session-not-found" };
    }
    const session = sessionSet.sessions.find(
      (candidate) => candidate.sessionId === command.sessionId,
    );
    if (session === undefined) {
      return { status: "session-not-found" };
    }
    if (
      !(await this.credentialRepository.authenticateAccount(
        session.accountId,
        command.password,
      ))
    ) {
      return { status: "invalid-credentials" };
    }
    const account = await this.accountGateway.getAccountReference(
      session.accountId,
    );
    if (account === null || account.lifecycleState !== "active") {
      return { status: "account-unavailable" };
    }
    const now = this.runtime.now();
    const reauthenticated = {
      ...session,
      status: "active" as const,
      authenticatedAt: now.toISOString(),
      expiresAt:
        account.accountType === "managed"
          ? new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString()
          : null,
    };
    await this.sessionRepository.save({
      ...sessionSet,
      sessions: sessionSet.sessions.map((candidate) =>
        candidate.sessionId === session.sessionId
          ? reauthenticated
          : candidate,
      ),
    });
    return {
      status: "reauthenticated",
      session: { ...reauthenticated, account },
    };
  }
}
