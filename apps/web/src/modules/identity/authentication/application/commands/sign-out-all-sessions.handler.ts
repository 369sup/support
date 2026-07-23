import type {
  SignOutAllSessionsCommand,
  SignOutAllSessionsResult,
  SignOutAllSessionsUseCase,
} from "../ports/inbound/sign-out-all-sessions.use-case";
import type { BrowserSessionSetRepositoryPort } from "../ports/outbound/browser-session-set.repository.port";

export class SignOutAllSessionsHandler implements SignOutAllSessionsUseCase {
  private readonly sessionRepository: BrowserSessionSetRepositoryPort;

  constructor(
    sessionRepository: BrowserSessionSetRepositoryPort,
  ) {
    this.sessionRepository = sessionRepository;
  }

  async signOutAllSessions(
    command: SignOutAllSessionsCommand,
  ): Promise<SignOutAllSessionsResult> {
    const sessionSet = await this.sessionRepository.findByToken(
      command.browserToken,
    );
    if (sessionSet === null) {
      return { status: "browser-session-not-found" };
    }
    await this.sessionRepository.delete(command.browserToken);
    return { status: "signed-out" };
  }
}
