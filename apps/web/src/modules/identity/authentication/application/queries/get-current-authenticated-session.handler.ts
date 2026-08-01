import type {
  GetCurrentAuthenticatedSessionQuery,
  GetCurrentAuthenticatedSessionResult,
  GetCurrentAuthenticatedSessionUseCase,
} from "../ports/inbound/get-current-authenticated-session.use-case";
import type { AccountReferenceGatewayPort } from "../ports/outbound/account-reference.gateway.port";
import type { BrowserSessionSetRepositoryPort } from "../ports/outbound/browser-session-set.repository.port";
import type { SessionRuntimeGatewayPort } from "../ports/outbound/session-runtime.gateway.port";

export class GetCurrentAuthenticatedSessionHandler
  implements GetCurrentAuthenticatedSessionUseCase
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

  async getCurrentAuthenticatedSession(
    query: GetCurrentAuthenticatedSessionQuery,
  ): Promise<GetCurrentAuthenticatedSessionResult> {
    const sessionSet = await this.sessionRepository.findByToken(
      query.browserToken,
    );
    const session = sessionSet?.sessions.find(
      (candidate) => candidate.sessionId === sessionSet.activeSessionId,
    );

    if (sessionSet === null || session === undefined) {
      return { status: "authentication-required" };
    }

    const isExpired =
      session.expiresAt !== null &&
      Date.parse(session.expiresAt) <= this.runtime.now().getTime();
    if (session.status !== "active" || isExpired) {
      if (isExpired && session.status === "active") {
        await this.sessionRepository.save({
          ...sessionSet,
          sessions: sessionSet.sessions.map((candidate) =>
            candidate.sessionId === session.sessionId
              ? { ...candidate, status: "expired" }
              : candidate,
          ),
        });
      }
      return { status: "authentication-required" };
    }

    const account = await this.accountGateway.getAccountReference(
      session.accountId,
    );
    if (account === null || account.lifecycleState !== "active") {
      return { status: "authentication-required" };
    }
    return { status: "authenticated", session: { ...session, account } };
  }
}
