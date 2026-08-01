import type {
  CreateDevelopmentSessionCommand,
  CreateDevelopmentSessionResult,
  CreateDevelopmentSessionUseCase,
} from "../ports/inbound/create-development-session.use-case";
import type { AccountReferenceGatewayPort } from "../ports/outbound/account-reference.gateway.port";
import type {
  AccountSessionSnapshot,
  BrowserSessionSetRepositoryPort,
} from "../ports/outbound/browser-session-set.repository.port";
import type { DevelopmentCredentialRepositoryPort } from "../ports/outbound/development-credential.repository.port";
import type { SessionRuntimeGatewayPort } from "../ports/outbound/session-runtime.gateway.port";

export class CreateDevelopmentSessionHandler
  implements CreateDevelopmentSessionUseCase
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

  async createDevelopmentSession(
    command: CreateDevelopmentSessionCommand,
  ): Promise<CreateDevelopmentSessionResult> {
    const accountId = await this.credentialRepository.authenticate(
      command.username.trim(),
      command.password,
    );
    if (accountId === null) {
      return { status: "invalid-credentials" };
    }

    const account = await this.accountGateway.getAccountReference(accountId);
    if (account === null || account.lifecycleState !== "active") {
      return { status: "account-unavailable" };
    }

    const existingSet =
      command.browserToken === null
        ? null
        : await this.sessionRepository.findByToken(command.browserToken);
    const browserToken =
      existingSet?.browserToken ?? this.runtime.createOpaqueId();
    const now = this.runtime.now();
    const expiresAt =
      account.accountType === "managed"
        ? new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString()
        : null;
    const existingSession = existingSet?.sessions.find(
      (session) => session.accountId === accountId,
    );
    const session: AccountSessionSnapshot = {
      sessionId: existingSession?.sessionId ?? this.runtime.createOpaqueId(),
      accountId,
      status: "active",
      authenticatedAt: now.toISOString(),
      expiresAt,
    };
    const sessions = [
      ...(existingSet?.sessions.filter(
        (candidate) => candidate.accountId !== accountId,
      ) ?? []),
      session,
    ];

    await this.sessionRepository.save({
      browserToken,
      activeSessionId: session.sessionId,
      sessions,
    });

    return {
      status: "created",
      browserToken,
      session: { ...session, account },
    };
  }
}
