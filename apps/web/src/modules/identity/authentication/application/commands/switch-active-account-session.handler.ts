import type {
  SwitchActiveAccountSessionCommand,
  SwitchActiveAccountSessionResult,
  SwitchActiveAccountSessionUseCase,
} from "../ports/inbound/switch-active-account-session.use-case";
import type { AccountReferenceGatewayPort } from "../ports/outbound/account-reference.gateway.port";
import type { BrowserSessionSetRepositoryPort } from "../ports/outbound/browser-session-set.repository.port";
import type { SessionRuntimeGatewayPort } from "../ports/outbound/session-runtime.gateway.port";

export class SwitchActiveAccountSessionHandler
  implements SwitchActiveAccountSessionUseCase
{
  private readonly sessionRepository: BrowserSessionSetRepositoryPort;
  private readonly accountGateway: AccountReferenceGatewayPort;
  private readonly runtime: SessionRuntimeGatewayPort;

  constructor(
    sessionRepository: BrowserSessionSetRepositoryPort,
    accountGateway: AccountReferenceGatewayPort,
    runtime: SessionRuntimeGatewayPort,
  ) {
    this.sessionRepository = sessionRepository;
    this.accountGateway = accountGateway;
    this.runtime = runtime;
  }

  async switchActiveAccountSession(
    command: SwitchActiveAccountSessionCommand,
  ): Promise<SwitchActiveAccountSessionResult> {
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

    const isExpired =
      session.expiresAt !== null &&
      Date.parse(session.expiresAt) <= this.runtime.now().getTime();
    if (session.status === "expired" || isExpired) {
      if (session.status !== "expired") {
        await this.sessionRepository.save({
          ...sessionSet,
          sessions: sessionSet.sessions.map((candidate) =>
            candidate.sessionId === session.sessionId
              ? { ...candidate, status: "expired" }
              : candidate,
          ),
        });
      }
      return {
        status: "reauthentication-required",
        sessionId: session.sessionId,
        accountId: session.accountId,
      };
    }
    if (session.status !== "active") {
      return { status: "session-not-switchable" };
    }

    const account = await this.accountGateway.getAccountReference(
      session.accountId,
    );
    if (account === null || account.lifecycleState !== "active") {
      return { status: "session-not-switchable" };
    }

    await this.sessionRepository.save({
      ...sessionSet,
      activeSessionId: session.sessionId,
    });
    return { status: "switched", session: { ...session, account } };
  }
}
