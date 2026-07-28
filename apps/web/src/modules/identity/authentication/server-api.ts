import { authenticationServerFacade } from "./composition/authentication.composition";

export const applyPasswordCredentialTransaction =
  authenticationServerFacade.applyPasswordCredentialTransaction;
export const changePassword =
  authenticationServerFacade.changePassword;
export { hasSameOrigin } from "./adapters/inbound/server/same-origin.adapter";

export type {
  AuthenticatedSessionReference,
  BrowserAccountSessionView,
  CreateDevelopmentSessionResult,
  CurrentSessionResult,
  ExpireSessionResult,
  ListBrowserAccountSessionsResult,
  ReauthenticateSessionResult,
  RemoveAccountSessionResult,
  SwitchAccountSessionResult,
} from "./contracts/authenticated-session-reference";

export const createDevelopmentSession =
  authenticationServerFacade.createDevelopmentSession;
export const createPasswordSession =
  authenticationServerFacade.createPasswordSession;
export const configureTotp = authenticationServerFacade.configureTotp;
export const clearBrowserSessionToken =
  authenticationServerFacade.clearBrowserSessionToken;
export const expireSession = authenticationServerFacade.expireSession;
export const enterSudoMode = authenticationServerFacade.enterSudoMode;
export const getCurrentAuthenticatedSession =
  authenticationServerFacade.getCurrentAuthenticatedSession;
export const getOptionalCurrentSession =
  authenticationServerFacade.getOptionalCurrentSession;
export const isInMemoryRuntimeEnabled =
  authenticationServerFacade.isInMemoryRuntimeEnabled;
export const isDevelopmentAuthenticationEnabled =
  authenticationServerFacade.isDevelopmentAuthenticationEnabled;
export const isPasswordAuthenticationEnabled =
  authenticationServerFacade.isPasswordAuthenticationEnabled;
export const listBrowserAccountSessions =
  authenticationServerFacade.listBrowserAccountSessions;
export const managePasskey = authenticationServerFacade.managePasskey;
export const recoverTwoFactor =
  authenticationServerFacade.recoverTwoFactor;
export const reauthenticateSession =
  authenticationServerFacade.reauthenticateSession;
export const removeAccountSession =
  authenticationServerFacade.removeAccountSession;
export const requestPasswordReset =
  authenticationServerFacade.requestPasswordReset;
export const resetPassword =
  authenticationServerFacade.resetPassword;
export const readBrowserSessionToken =
  authenticationServerFacade.readBrowserSessionToken;
export const requireCurrentSession =
  authenticationServerFacade.requireCurrentSession;
export const signOutAllSessions =
  authenticationServerFacade.signOutAllSessions;
export const switchActiveAccountSession =
  authenticationServerFacade.switchActiveAccountSession;
export const writeBrowserSessionToken =
  authenticationServerFacade.writeBrowserSessionToken;
export const verifyAdditionalFactor =
  authenticationServerFacade.verifyAdditionalFactor;
