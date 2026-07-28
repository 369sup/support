import "server-only";

import { browserSessionCookie } from "../adapters/inbound/next/browser-session-cookie.adapter";
import { createCurrentSessionAdapter } from "../adapters/inbound/next/current-session.adapter";
import { AccountReferenceAdapter } from "../adapters/outbound/integration/account-reference.adapter";
import { InMemoryBrowserSessionSetAdapter } from "../adapters/outbound/persistence/in-memory-browser-session-set.adapter";
import { InMemoryDevelopmentCredentialAdapter } from "../adapters/outbound/persistence/in-memory-development-credential.adapter";
import { PostgresBrowserSessionSetAdapter } from "../adapters/outbound/persistence/postgres-browser-session-set.adapter";
import { PostgresCredentialAdapter } from "../adapters/outbound/persistence/postgres-credential.adapter";
import { InMemoryAccountSecurityAdapter } from "../adapters/outbound/persistence/in-memory-account-security.adapter";
import { PostgresAccountSecurityAdapter } from "../adapters/outbound/persistence/postgres-account-security.adapter";
import { PostgresPasswordMaintenanceAdapter } from "../adapters/outbound/persistence/postgres-password-maintenance.adapter";
import { UnavailablePasswordMaintenanceAdapter } from "../adapters/outbound/persistence/unavailable-password-maintenance.adapter";
import { NotificationChannelPasswordRecoveryAdapter } from "../adapters/outbound/integration/notification-channel-password-recovery.adapter";
import { NodePasswordMaintenanceRuntimeAdapter } from "../adapters/outbound/runtime/node-password-maintenance-runtime.adapter";
import { NodeSessionRuntimeAdapter } from "../adapters/outbound/runtime/node-session-runtime.adapter";
import { NodeSecurityRuntimeAdapter } from "../adapters/outbound/runtime/node-security-runtime.adapter";
import { OtpauthTotpAdapter } from "../adapters/outbound/runtime/otpauth-totp.adapter";
import { SimpleWebAuthnAdapter } from "../adapters/outbound/runtime/simple-webauthn.adapter";
import { CreateDevelopmentSessionHandler } from "../application/commands/create-development-session.handler";
import { CreatePasswordSessionHandler } from "../application/commands/create-password-session.handler";
import { ChangePasswordHandler } from "../application/commands/change-password.handler";
import { ApplyPasswordCredentialTransactionHandler } from "../application/commands/apply-password-credential-transaction.handler";
import { RequestPasswordResetHandler } from "../application/commands/request-password-reset.handler";
import { ResetPasswordHandler } from "../application/commands/reset-password.handler";
import type { ApplyPasswordCredentialTransactionUseCase } from "../application/ports/inbound/apply-password-credential-transaction.use-case";
import type { ChangePasswordUseCase } from "../application/ports/inbound/change-password.use-case";
import type { RequestPasswordResetUseCase } from "../application/ports/inbound/request-password-reset.use-case";
import type { ResetPasswordUseCase } from "../application/ports/inbound/reset-password.use-case";
import { ConfigureTotpHandler } from "../application/commands/configure-totp.handler";
import { EnterSudoModeHandler } from "../application/commands/enter-sudo-mode.handler";
import { ManagePasskeyHandler } from "../application/commands/manage-passkey.handler";
import { RecoverTwoFactorHandler } from "../application/commands/recover-two-factor.handler";
import { VerifyAdditionalFactorHandler } from "../application/commands/verify-additional-factor.handler";
import type { ConfigureTotpUseCase } from "../application/ports/inbound/configure-totp.use-case";
import type { EnterSudoModeUseCase } from "../application/ports/inbound/enter-sudo-mode.use-case";
import type { ManagePasskeyUseCase } from "../application/ports/inbound/manage-passkey.use-case";
import type { RecoverTwoFactorUseCase } from "../application/ports/inbound/recover-two-factor.use-case";
import type { VerifyAdditionalFactorUseCase } from "../application/ports/inbound/verify-additional-factor.use-case";
import { AccountSecurityService } from "../application/services/account-security.service";
import { PasswordMaintenanceService } from "../application/services/password-maintenance.service";
import { ExpireSessionHandler } from "../application/commands/expire-session.handler";
import { ReauthenticateSessionHandler } from "../application/commands/reauthenticate-session.handler";
import { RemoveAccountSessionHandler } from "../application/commands/remove-account-session.handler";
import { SignOutAllSessionsHandler } from "../application/commands/sign-out-all-sessions.handler";
import { SwitchActiveAccountSessionHandler } from "../application/commands/switch-active-account-session.handler";
import { GetCurrentAuthenticatedSessionHandler } from "../application/queries/get-current-authenticated-session.handler";
import { ListBrowserAccountSessionsHandler } from "../application/queries/list-browser-account-sessions.handler";
import type {
  AuthenticatedSessionReference,
  CreateDevelopmentSessionResult,
  CurrentSessionResult,
  ExpireSessionResult,
  ListBrowserAccountSessionsResult,
  ReauthenticateSessionResult,
  RemoveAccountSessionResult,
  SwitchAccountSessionResult,
} from "../contracts/authenticated-session-reference";
import { getProductionDatabase } from "../../../../../production-runtime";

type PasswordSessionInput = Readonly<{
  browserToken: string | null;
  username: string;
  password: string;
  secondFactor?:
    | Readonly<{ kind: "recovery-code"; code: string }>
    | Readonly<{ kind: "totp"; token: string }>;
}>;

export interface AuthenticationServerFacade {
  applyPasswordCredentialTransaction: ApplyPasswordCredentialTransactionUseCase["applyPasswordCredentialTransaction"];
  changePassword: ChangePasswordUseCase["changePassword"];
  configureTotp: ConfigureTotpUseCase["configureTotp"];
  clearBrowserSessionToken: () => Promise<void>;
  createPasswordSession: (
    input: PasswordSessionInput,
  ) => Promise<CreateDevelopmentSessionResult>;
  createDevelopmentSession: (
    input: PasswordSessionInput,
  ) => Promise<CreateDevelopmentSessionResult>;
  enterSudoMode: EnterSudoModeUseCase["enterSudoMode"];
  expireSession: (input: {
    browserToken: string;
    sessionId: string;
  }) => Promise<ExpireSessionResult>;
  getCurrentAuthenticatedSession: (
    browserToken: string,
  ) => Promise<CurrentSessionResult>;
  getOptionalCurrentSession: () => Promise<AuthenticatedSessionReference | null>;
  isInMemoryRuntimeEnabled: () => boolean;
  isDevelopmentAuthenticationEnabled: () => boolean;
  isPasswordAuthenticationEnabled: () => boolean;
  listBrowserAccountSessions: (
    browserToken: string,
  ) => Promise<ListBrowserAccountSessionsResult>;
  managePasskey: ManagePasskeyUseCase["managePasskey"];
  recoverTwoFactor: RecoverTwoFactorUseCase["recoverTwoFactor"];
  reauthenticateSession: (input: {
    browserToken: string;
    sessionId: string;
    password: string;
  }) => Promise<ReauthenticateSessionResult>;
  removeAccountSession: (input: {
    browserToken: string;
    sessionId: string;
  }) => Promise<RemoveAccountSessionResult>;
  requestPasswordReset: RequestPasswordResetUseCase["requestPasswordReset"];
  resetPassword: ResetPasswordUseCase["resetPassword"];
  signOutAllSessions: (
    browserToken: string,
  ) => Promise<
    | { status: "signed-out" }
    | { status: "browser-session-not-found" }
  >;
  switchActiveAccountSession: (input: {
    browserToken: string;
    sessionId: string;
  }) => Promise<SwitchAccountSessionResult>;
  readBrowserSessionToken: () => Promise<string | null>;
  requireCurrentSession: () => Promise<AuthenticatedSessionReference>;
  writeBrowserSessionToken: (browserToken: string) => Promise<void>;
  verifyAdditionalFactor: VerifyAdditionalFactorUseCase["verifyAdditionalFactor"];
}

function composeAuthenticationServerFacade(): AuthenticationServerFacade {
  const database = getProductionDatabase();
  const sessionRepository =
    database === null
      ? new InMemoryBrowserSessionSetAdapter()
      : new PostgresBrowserSessionSetAdapter(database);
  const credentialRepository =
    database === null
      ? new InMemoryDevelopmentCredentialAdapter()
      : new PostgresCredentialAdapter(database);
  const factorEncryptionKey =
    process.env["AUTH_FACTOR_ENCRYPTION_KEY"];
  if (
    database !== null &&
    (factorEncryptionKey === undefined ||
      factorEncryptionKey.trim() === "")
  ) {
    throw new Error(
      "AUTH_FACTOR_ENCRYPTION_KEY is required in PostgreSQL mode.",
    );
  }
  const securityRepository =
    database === null
      ? new InMemoryAccountSecurityAdapter()
      : new PostgresAccountSecurityAdapter(database);
  const securityRuntime = new NodeSecurityRuntimeAdapter(
    factorEncryptionKey,
  );
  const securityService = new AccountSecurityService(
    securityRepository,
    new OtpauthTotpAdapter(),
    new SimpleWebAuthnAdapter({
      origin:
        process.env["WEBAUTHN_ORIGIN"] ?? "http://localhost:3000",
      rpId: process.env["WEBAUTHN_RP_ID"] ?? "localhost",
      rpName: process.env["WEBAUTHN_RP_NAME"] ?? "Support",
    }),
    securityRuntime,
  );
  const configureTotpHandler = new ConfigureTotpHandler(securityService);
  const enterSudoModeHandler = new EnterSudoModeHandler(securityService);
  const managePasskeyHandler = new ManagePasskeyHandler(securityService);
  const recoverTwoFactorHandler = new RecoverTwoFactorHandler(
    securityService,
  );
  const verifyAdditionalFactorHandler =
    new VerifyAdditionalFactorHandler(securityService);
  const passwordMaintenanceRepository =
    database === null
      ? new UnavailablePasswordMaintenanceAdapter()
      : new PostgresPasswordMaintenanceAdapter(database);
  const passwordMaintenanceService = new PasswordMaintenanceService(
    passwordMaintenanceRepository,
    sessionRepository,
    new NodePasswordMaintenanceRuntimeAdapter(),
    new NotificationChannelPasswordRecoveryAdapter(),
  );
  const changePasswordHandler = new ChangePasswordHandler(
    passwordMaintenanceService,
  );
  const requestPasswordResetHandler = new RequestPasswordResetHandler(
    passwordMaintenanceService,
  );
  const resetPasswordHandler = new ResetPasswordHandler(
    passwordMaintenanceService,
  );
  const applyCredentialTransaction =
    new ApplyPasswordCredentialTransactionHandler(credentialRepository);
  const accountGateway = new AccountReferenceAdapter();
  const runtime = new NodeSessionRuntimeAdapter();

  const create = new CreateDevelopmentSessionHandler(
    sessionRepository,
    credentialRepository,
    accountGateway,
    runtime,
    securityService,
  );
  const current = new GetCurrentAuthenticatedSessionHandler(
    sessionRepository,
    accountGateway,
    runtime,
  );
  const createPasswordSessionHandler =
    new CreatePasswordSessionHandler(create);
  const list = new ListBrowserAccountSessionsHandler(
    sessionRepository,
    accountGateway,
    runtime,
  );
  const switchSession = new SwitchActiveAccountSessionHandler(
    sessionRepository,
    accountGateway,
    runtime,
  );
  const remove = new RemoveAccountSessionHandler(
    sessionRepository,
    accountGateway,
  );
  const signOut = new SignOutAllSessionsHandler(sessionRepository);
  const expire = new ExpireSessionHandler(sessionRepository);
  const reauthenticate = new ReauthenticateSessionHandler(
    sessionRepository,
    credentialRepository,
    accountGateway,
    runtime,
  );
  const currentSession = createCurrentSessionAdapter({
    readBrowserSessionToken: browserSessionCookie.read,
    getCurrentAuthenticatedSession: (browserToken) =>
      current.getCurrentAuthenticatedSession({ browserToken }),
  });

  return {
    applyPasswordCredentialTransaction: (command) =>
      applyCredentialTransaction.applyPasswordCredentialTransaction(command),
    changePassword: (command) =>
      changePasswordHandler.changePassword(command),
    clearBrowserSessionToken: browserSessionCookie.clear,
    createPasswordSession: (input) =>
      createPasswordSessionHandler.createPasswordSession(input),
    configureTotp: (command) =>
      configureTotpHandler.configureTotp(command),
    createDevelopmentSession: (input) =>
      create.createDevelopmentSession(input),
    expireSession: (input) => expire.expireSession(input),
    enterSudoMode: (command) =>
      enterSudoModeHandler.enterSudoMode(command),
    getCurrentAuthenticatedSession: (browserToken) =>
      current.getCurrentAuthenticatedSession({ browserToken }),
    getOptionalCurrentSession:
      currentSession.getOptionalCurrentSession,
    isInMemoryRuntimeEnabled:
      browserSessionCookie.isInMemoryRuntimeEnabled,
    isDevelopmentAuthenticationEnabled: () =>
      browserSessionCookie.isInMemoryRuntimeEnabled() &&
      credentialRepository instanceof
        InMemoryDevelopmentCredentialAdapter &&
      credentialRepository.isConfigured(),
    isPasswordAuthenticationEnabled: () =>
      database !== null ||
      (credentialRepository instanceof
        InMemoryDevelopmentCredentialAdapter &&
        credentialRepository.isConfigured()),
    listBrowserAccountSessions: (browserToken) =>
      list.listBrowserAccountSessions({ browserToken }),
    managePasskey: (command) =>
      managePasskeyHandler.managePasskey(command),
    recoverTwoFactor: (command) =>
      recoverTwoFactorHandler.recoverTwoFactor(command),
    reauthenticateSession: (input) =>
      reauthenticate.reauthenticateSession(input),
    removeAccountSession: (input) => remove.removeAccountSession(input),
    requestPasswordReset: (command) =>
      requestPasswordResetHandler.requestPasswordReset(command),
    resetPassword: (command) =>
      resetPasswordHandler.resetPassword(command),
    signOutAllSessions: (browserToken) =>
      signOut.signOutAllSessions({ browserToken }),
    switchActiveAccountSession: (input) =>
      switchSession.switchActiveAccountSession(input),
    readBrowserSessionToken: browserSessionCookie.read,
    requireCurrentSession: currentSession.requireCurrentSession,
    writeBrowserSessionToken: browserSessionCookie.write,
    verifyAdditionalFactor: (command) =>
      verifyAdditionalFactorHandler.verifyAdditionalFactor(command),
  };
}

export const authenticationServerFacade =
  composeAuthenticationServerFacade();
