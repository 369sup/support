import type {
  ExpireSessionCommand,
  ExpireSessionResult,
  ExpireSessionUseCase,
} from "../ports/inbound/expire-session.use-case";
import type { BrowserSessionSetRepositoryPort } from "../ports/outbound/browser-session-set.repository.port";

export class ExpireSessionHandler implements ExpireSessionUseCase {
  private readonly sessionRepository: BrowserSessionSetRepositoryPort;

  constructor(
    sessionRepository: BrowserSessionSetRepositoryPort,
  ) {
    this.sessionRepository = sessionRepository;
  }

  async expireSession(
    command: ExpireSessionCommand,
  ): Promise<ExpireSessionResult> {
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
    await this.sessionRepository.save({
      ...sessionSet,
      sessions: sessionSet.sessions.map((session) =>
        session.sessionId === command.sessionId
          ? { ...session, status: "expired" }
          : session,
      ),
    });
    return { status: "expired" };
  }
}
