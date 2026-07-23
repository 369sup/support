import type {
  BrowserAccountSessionSnapshot,
  ListBrowserAccountSessionsQuery,
  ListBrowserAccountSessionsResult,
  ListBrowserAccountSessionsUseCase,
} from "../ports/inbound/list-browser-account-sessions.use-case";
import type { AccountReferenceGatewayPort } from "../ports/outbound/account-reference.gateway.port";
import type { BrowserSessionSetRepositoryPort } from "../ports/outbound/browser-session-set.repository.port";
import type { SessionRuntimeGatewayPort } from "../ports/outbound/session-runtime.gateway.port";

export class ListBrowserAccountSessionsHandler
  implements ListBrowserAccountSessionsUseCase
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

  async listBrowserAccountSessions(
    query: ListBrowserAccountSessionsQuery,
  ): Promise<ListBrowserAccountSessionsResult> {
    const sessionSet = await this.sessionRepository.findByToken(
      query.browserToken,
    );
    if (sessionSet === null) {
      return { status: "browser-session-not-found" };
    }

    const sessions: BrowserAccountSessionSnapshot[] = [];
    for (const session of sessionSet.sessions) {
      const account = await this.accountGateway.getAccountReference(
        session.accountId,
      );
      if (account !== null) {
        const isExpired =
          session.expiresAt !== null &&
          Date.parse(session.expiresAt) <= this.runtime.now().getTime();
        sessions.push({
          ...session,
          status: isExpired ? "expired" : session.status,
          account,
          isCurrent: session.sessionId === sessionSet.activeSessionId,
        });
      }
    }
    return { status: "found", sessions };
  }
}
