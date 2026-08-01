import "server-only";

import { browserSessionCookie } from "../adapters/inbound/next/browser-session-cookie.adapter";
import { createCurrentSessionAdapter } from "../adapters/inbound/next/current-session.adapter";
import { createRequiredCurrentSessionAdapter } from "../adapters/inbound/next/required-current-session.adapter";
import { createSupabaseServerAuthGateway } from "../adapters/inbound/next/supabase-auth-gateway.adapter";
import { AccountReferenceAdapter } from "../adapters/outbound/integration/account-reference.adapter";
import { SupabaseAuthenticationAdapter } from "../adapters/outbound/integration/supabase-authentication.adapter";
import { InMemoryBrowserSessionSetAdapter } from "../adapters/outbound/persistence/in-memory-browser-session-set.adapter";
import { PostgresExternalIdentityAdapter } from "../adapters/outbound/persistence/postgres-external-identity.adapter";
import { PostgresBrowserSessionSetAdapter } from "../adapters/outbound/persistence/postgres-browser-session-set.adapter";
import { PostgresCredentialAdapter } from "../adapters/outbound/persistence/postgres-credential.adapter";
import { InMemoryAccountSecurityAdapter } from "../adapters/outbound/persistence/in-memory-account-security.adapter";
import { PostgresAccountSecurityAdapter } from "../adapters/outbound/persistence/postgres-account-security.adapter";
import { PostgresPasswordMaintenanceAdapter } from "../adapters/outbound/persistence/postgres-password-maintenance.adapter";
import { UnavailablePasswordMaintenanceAdapter } from "../adapters/outbound/persistence/unavailable-password-maintenance.adapter";
import { UnavailablePasswordCredentialTransactionAdapter } from "../adapters/outbound/persistence/unavailable-password-credential-transaction.adapter";
import { NotificationChannelPasswordRecoveryAdapter } from "../adapters/outbound/integration/notification-channel-password-recovery.adapter";
import { NodePasswordMaintenanceRuntimeAdapter } from "../adapters/outbound/runtime/node-password-maintenance-runtime.adapter";
import { NodeSessionRuntimeAdapter } from "../adapters/outbound/runtime/node-session-runtime.adapter";
import { NodeSecurityRuntimeAdapter } from "../adapters/outbound/runtime/node-security-runtime.adapter";
import { OtpauthTotpAdapter } from "../adapters/outbound/runtime/otpauth-totp.adapter";
import { SimpleWebAuthnAdapter } from "../adapters/outbound/runtime/simple-webauthn.adapter";
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
import { RemoveAccountSessionHandler } from "../application/commands/remove-account-session.handler";
import { SignOutAllSessionsHandler } from "../application/commands/sign-out-all-sessions.handler";
import { SwitchActiveAccountSessionHandler } from "../application/commands/switch-active-account-session.handler";
import { GetCurrentAuthenticatedSessionHandler } from "../application/queries/get-current-authenticated-session.handler";
import { ListBrowserAccountSessionsHandler } from "../application/queries/list-browser-account-sessions.handler";
import type {
  AuthenticatedSessionReference,
  CurrentSessionResult,
  ListBrowserAccountSessionsResult,
  RemoveAccountSessionResult,
  SwitchAccountSessionResult,
} from "../contracts/authenticated-session-reference";
import type {
  ExternalAccountProvisioningResult,
  ExternalAccountProvisioningState,
  ExternalAuthenticationProvider,
  ExternalSignInCompletionResult,
  ExternalSignInStartResult,
  SupabaseConfirmationResult,
  SupabasePasswordSignInResult,
  SupabasePasswordSignUpResult,
} from "../contracts/supabase-authentication";
import { getProductionDatabase } from "../../../../../production-runtime";
import { resolveWebAuthenticationConfiguration } from "../../../../../supabase-auth-configuration";

type EmailConfirmationType =
  | "email"
  | "email_change"
  | "invite"
  | "magiclink"
  | "recovery"
  | "signup";

export interface AuthenticationServerFacade {
  applyPasswordCredentialTransaction: ApplyPasswordCredentialTransactionUseCase["applyPasswordCredentialTransaction"];
  changePassword: ChangePasswordUseCase["changePassword"];
  configureTotp: ConfigureTotpUseCase["configureTotp"];
  completeExternalAccountProvisioning: (input: {
    username: string;
  }) => Promise<ExternalAccountProvisioningResult>;
  completeExternalSignIn: (input: {
    code: string;
    flowId?: string;
  }) => Promise<ExternalSignInCompletionResult>;
  clearBrowserSessionToken: () => Promise<void>;
  enterSudoMode: EnterSudoModeUseCase["enterSudoMode"];
  getCurrentAuthenticatedSession: (
    browserToken: string,
  ) => Promise<CurrentSessionResult>;
  getOptionalCurrentSession: () => Promise<AuthenticatedSessionReference | null>;
  getExternalAccountProvisioningState: () => Promise<ExternalAccountProvisioningState>;
  isInMemoryRuntimeEnabled: () => boolean;
  isPasswordAuthenticationEnabled: () => boolean;
  isSupabaseAuthenticationEnabled: () => boolean;
  listBrowserAccountSessions: (
    browserToken: string,
  ) => Promise<ListBrowserAccountSessionsResult>;
  managePasskey: ManagePasskeyUseCase["managePasskey"];
  recoverTwoFactor: RecoverTwoFactorUseCase["recoverTwoFactor"];
  removeAccountSession: (input: {
    browserToken: string;
    sessionId: string;
  }) => Promise<RemoveAccountSessionResult>;
  requestPasswordReset: RequestPasswordResetUseCase["requestPasswordReset"];
  requestSupabasePasswordReset: (input: {
    email: string;
    redirectTo: string;
  }) => Promise<void>;
  resetPassword: ResetPasswordUseCase["resetPassword"];
  signInWithPassword: (input: {
    identifier: string;
    password: string;
  }) => Promise<SupabasePasswordSignInResult>;
  startExternalSignIn: (input: {
    provider: ExternalAuthenticationProvider;
    redirectTo: string;
  }) => Promise<ExternalSignInStartResult>;
  signOutCurrentSession: () => Promise<void>;
  signUpWithPassword: (input: {
    email: string;
    emailRedirectTo: string;
    password: string;
    username: string;
  }) => Promise<SupabasePasswordSignUpResult>;
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
  updateSupabasePassword: (password: string) => Promise<boolean>;
  verifySupabaseOtp: (input: {
    tokenHash: string;
    type: EmailConfirmationType;
  }) => Promise<SupabaseConfirmationResult>;
  verifyAdditionalFactor: VerifyAdditionalFactorUseCase["verifyAdditionalFactor"];
}

function composeAuthenticationServerFacade(): AuthenticationServerFacade {
  const database = getProductionDatabase();
  const authenticationConfiguration =
    resolveWebAuthenticationConfiguration();
  const legacyDatabase =
    authenticationConfiguration.provider === "unavailable"
      ? database
      : null;
  const sessionRepository =
    legacyDatabase === null
      ? new InMemoryBrowserSessionSetAdapter()
      : new PostgresBrowserSessionSetAdapter(legacyDatabase);
  const credentialTransactionRepository =
    legacyDatabase === null
      ? new UnavailablePasswordCredentialTransactionAdapter()
      : new PostgresCredentialAdapter(legacyDatabase);
  const factorEncryptionKey =
    process.env["AUTH_FACTOR_ENCRYPTION_KEY"];
  if (
    legacyDatabase !== null &&
    (factorEncryptionKey === undefined ||
      factorEncryptionKey.trim() === "")
  ) {
    throw new Error(
      "AUTH_FACTOR_ENCRYPTION_KEY is required in PostgreSQL mode.",
    );
  }
  const securityRepository =
    legacyDatabase === null
      ? new InMemoryAccountSecurityAdapter()
      : new PostgresAccountSecurityAdapter(legacyDatabase);
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
    legacyDatabase === null
      ? new UnavailablePasswordMaintenanceAdapter()
      : new PostgresPasswordMaintenanceAdapter(legacyDatabase);
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
    new ApplyPasswordCredentialTransactionHandler(
      credentialTransactionRepository,
    );
  const accountGateway = new AccountReferenceAdapter();
  const runtime = new NodeSessionRuntimeAdapter();

  const current = new GetCurrentAuthenticatedSessionHandler(
    sessionRepository,
    accountGateway,
    runtime,
  );
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
  const currentSession = createCurrentSessionAdapter({
    readBrowserSessionToken: browserSessionCookie.read,
    getCurrentAuthenticatedSession: (browserToken) =>
      current.getCurrentAuthenticatedSession({ browserToken }),
  });
  const supabaseAuthentication =
    authenticationConfiguration.provider === "supabase" && database !== null
      ? new SupabaseAuthenticationAdapter(
          new PostgresExternalIdentityAdapter(database),
          createSupabaseServerAuthGateway,
        )
      : null;
  const resolvedCurrentSession = createRequiredCurrentSessionAdapter(() =>
    supabaseAuthentication === null
      ? currentSession.getOptionalCurrentSession()
      : supabaseAuthentication.getOptionalCurrentSession(),
  );

  return {
    applyPasswordCredentialTransaction: (command) =>
      applyCredentialTransaction.applyPasswordCredentialTransaction(command),
    changePassword: (command) =>
      changePasswordHandler.changePassword(command),
    clearBrowserSessionToken: browserSessionCookie.clear,
    completeExternalAccountProvisioning: (input) =>
      supabaseAuthentication?.completeExternalAccountProvisioning(input) ??
      Promise.resolve({ status: "service-unavailable" }),
    completeExternalSignIn: (input) =>
      supabaseAuthentication?.completeExternalSignIn(input) ??
      Promise.resolve({ status: "service-unavailable" }),
    configureTotp: (command) =>
      configureTotpHandler.configureTotp(command),
    enterSudoMode: (command) =>
      enterSudoModeHandler.enterSudoMode(command),
    getCurrentAuthenticatedSession: (browserToken) =>
      current.getCurrentAuthenticatedSession({ browserToken }),
    getExternalAccountProvisioningState: () =>
      supabaseAuthentication?.getExternalAccountProvisioningState() ??
      Promise.resolve({ status: "unavailable" }),
    getOptionalCurrentSession:
      resolvedCurrentSession.getOptionalCurrentSession,
    isInMemoryRuntimeEnabled:
      browserSessionCookie.isInMemoryRuntimeEnabled,
    isPasswordAuthenticationEnabled: () => supabaseAuthentication !== null,
    isSupabaseAuthenticationEnabled: () =>
      supabaseAuthentication !== null,
    listBrowserAccountSessions: (browserToken) =>
      list.listBrowserAccountSessions({ browserToken }),
    managePasskey: (command) =>
      managePasskeyHandler.managePasskey(command),
    recoverTwoFactor: (command) =>
      recoverTwoFactorHandler.recoverTwoFactor(command),
    removeAccountSession: (input) => remove.removeAccountSession(input),
    requestPasswordReset: (command) =>
      requestPasswordResetHandler.requestPasswordReset(command),
    requestSupabasePasswordReset: (input) =>
      supabaseAuthentication?.requestPasswordReset(input) ??
      Promise.resolve(),
    resetPassword: (command) =>
      resetPasswordHandler.resetPassword(command),
    signInWithPassword: (input) =>
      supabaseAuthentication?.signInWithPassword(input) ??
      Promise.resolve({ status: "service-unavailable" }),
    startExternalSignIn: (input) =>
      supabaseAuthentication?.startExternalSignIn(input) ??
      Promise.resolve({ status: "service-unavailable" }),
    signOutCurrentSession: async () => {
      if (supabaseAuthentication !== null) {
        await supabaseAuthentication.signOut();
        return;
      }
      const browserToken = await browserSessionCookie.read();
      if (browserToken !== null) {
        await signOut.signOutAllSessions({ browserToken });
        await browserSessionCookie.clear();
      }
    },
    signUpWithPassword: (input) =>
      supabaseAuthentication?.signUpWithPassword(input) ??
      Promise.resolve({ status: "service-unavailable" }),
    signOutAllSessions: (browserToken) =>
      signOut.signOutAllSessions({ browserToken }),
    switchActiveAccountSession: (input) =>
      switchSession.switchActiveAccountSession(input),
    readBrowserSessionToken: browserSessionCookie.read,
    requireCurrentSession: resolvedCurrentSession.requireCurrentSession,
    updateSupabasePassword: (password) =>
      supabaseAuthentication?.updatePassword(password) ??
      Promise.resolve(false),
    verifySupabaseOtp: (input) =>
      supabaseAuthentication?.verifyOtp({
        tokenHash: input.tokenHash,
        type: input.type,
      }) ?? Promise.resolve({ status: "service-unavailable" }),
    writeBrowserSessionToken: browserSessionCookie.write,
    verifyAdditionalFactor: (command) =>
      verifyAdditionalFactorHandler.verifyAdditionalFactor(command),
  };
}

export const authenticationServerFacade =
  composeAuthenticationServerFacade();
