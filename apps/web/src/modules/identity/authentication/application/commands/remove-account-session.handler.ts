import type {
  RemoveAccountSessionCommand,
  RemoveAccountSessionResult,
  RemoveAccountSessionUseCase,
} from "../ports/inbound/remove-account-session.use-case";
import type { AccountReferenceGatewayPort } from "../ports/outbound/account-reference.gateway.port";
import type { BrowserSessionSetRepositoryPort } from "../ports/outbound/browser-session-set.repository.port";

export class RemoveAccountSessionHandler
  implements RemoveAccountSessionUseCase
{
  private readonly sessionRepository: BrowserSessionSetRepositoryPort;
  private readonly accountGateway: AccountReferenceGatewayPort;

  constructor(
    sessionRepository: BrowserSessionSetRepositoryPort,
    accountGateway: AccountReferenceGatewayPort,
  ) {
    this.sessionRepository = sessionRepository;
    this.accountGateway = accountGateway;
  }

  async removeAccountSession(
    command: RemoveAccountSessionCommand,
  ): Promise<RemoveAccountSessionResult> {
    const sessionSet = await this.sessionRepository.findByToken(
      command.browserToken,
    );
    if (sessionSet === null) {
      return { status: "browser-session-not-found" };
    }
    if (
      !sessionSet.sessions.some(
        (session) => session.sessionId === command.sessionId,
      )
    ) {
      return { status: "session-not-found" };
    }

    const remaining = sessionSet.sessions.filter(
      (session) => session.sessionId !== command.sessionId,
    );
    if (remaining.length === 0) {
      await this.sessionRepository.delete(command.browserToken);
      return {
        status: "removed",
        currentSession: null,
        browserSessionEmpty: true,
      };
    }

    const current =
      sessionSet.activeSessionId === command.sessionId
        ? remaining.find((session) => session.status === "active") ?? null
        : remaining.find(
            (session) => session.sessionId === sessionSet.activeSessionId,
          ) ?? null;
    await this.sessionRepository.save({
      ...sessionSet,
      sessions: remaining,
      activeSessionId: current?.sessionId ?? null,
    });

    if (current === null) {
      return {
        status: "removed",
        currentSession: null,
        browserSessionEmpty: false,
      };
    }
    const account = await this.accountGateway.getAccountReference(
      current.accountId,
    );
    return {
      status: "removed",
      currentSession: account === null ? null : { ...current, account },
      browserSessionEmpty: false,
    };
  }
}
