import { authenticationServerFacade } from "./composition/authentication.composition";

export const applyPasswordCredentialTransaction =
  authenticationServerFacade.applyPasswordCredentialTransaction;
export const changePassword =
  authenticationServerFacade.changePassword;
export { hasSameOrigin } from "./adapters/inbound/server/same-origin.adapter";

export type {
  AuthenticatedSessionReference,
  BrowserAccountSessionView,
  CurrentSessionResult,
  ListBrowserAccountSessionsResult,
  RemoveAccountSessionResult,
  SwitchAccountSessionResult,
} from "./contracts/authenticated-session-reference";
export type {
  ExternalAccountProvisioningResult,
  ExternalAccountProvisioningState,
  ExternalAuthenticationProvider,
  ExternalSignInCompletionResult,
  ExternalSignInStartResult,
  SupabaseConfirmationResult,
  SupabasePasswordSignInResult,
  SupabasePasswordSignUpResult,
} from "./contracts/supabase-authentication";

export const configureTotp = authenticationServerFacade.configureTotp;
export const completeExternalAccountProvisioning =
  authenticationServerFacade.completeExternalAccountProvisioning;
export const completeExternalSignIn =
  authenticationServerFacade.completeExternalSignIn;
export const clearBrowserSessionToken =
  authenticationServerFacade.clearBrowserSessionToken;
export const enterSudoMode = authenticationServerFacade.enterSudoMode;
export const getCurrentAuthenticatedSession =
  authenticationServerFacade.getCurrentAuthenticatedSession;
export const getExternalAccountProvisioningState =
  authenticationServerFacade.getExternalAccountProvisioningState;
export const getOptionalCurrentSession =
  authenticationServerFacade.getOptionalCurrentSession;
export const isInMemoryRuntimeEnabled =
  authenticationServerFacade.isInMemoryRuntimeEnabled;
export const isPasswordAuthenticationEnabled =
  authenticationServerFacade.isPasswordAuthenticationEnabled;
export const isSupabaseAuthenticationEnabled =
  authenticationServerFacade.isSupabaseAuthenticationEnabled;
export const listBrowserAccountSessions =
  authenticationServerFacade.listBrowserAccountSessions;
export const managePasskey = authenticationServerFacade.managePasskey;
export const recoverTwoFactor =
  authenticationServerFacade.recoverTwoFactor;
export const removeAccountSession =
  authenticationServerFacade.removeAccountSession;
export const requestPasswordReset =
  authenticationServerFacade.requestPasswordReset;
export const requestSupabasePasswordReset =
  authenticationServerFacade.requestSupabasePasswordReset;
export const resetPassword =
  authenticationServerFacade.resetPassword;
export const readBrowserSessionToken =
  authenticationServerFacade.readBrowserSessionToken;
export const requireCurrentSession =
  authenticationServerFacade.requireCurrentSession;
export const signOutAllSessions =
  authenticationServerFacade.signOutAllSessions;
export const signInWithPassword =
  authenticationServerFacade.signInWithPassword;
export const startExternalSignIn =
  authenticationServerFacade.startExternalSignIn;
export const signOutCurrentSession =
  authenticationServerFacade.signOutCurrentSession;
export const signUpWithPassword =
  authenticationServerFacade.signUpWithPassword;
export const switchActiveAccountSession =
  authenticationServerFacade.switchActiveAccountSession;
export const writeBrowserSessionToken =
  authenticationServerFacade.writeBrowserSessionToken;
export const updateSupabasePassword =
  authenticationServerFacade.updateSupabasePassword;
export const verifySupabaseOtp =
  authenticationServerFacade.verifySupabaseOtp;
export const verifyAdditionalFactor =
  authenticationServerFacade.verifyAdditionalFactor;
