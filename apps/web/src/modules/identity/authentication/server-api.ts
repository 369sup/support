import { authenticationServerFacade } from "./composition/authentication.composition";

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
export const clearBrowserSessionToken =
  authenticationServerFacade.clearBrowserSessionToken;
export const expireSession = authenticationServerFacade.expireSession;
export const getCurrentAuthenticatedSession =
  authenticationServerFacade.getCurrentAuthenticatedSession;
export const getOptionalCurrentSession =
  authenticationServerFacade.getOptionalCurrentSession;
export const isInMemoryRuntimeEnabled =
  authenticationServerFacade.isInMemoryRuntimeEnabled;
export const listBrowserAccountSessions =
  authenticationServerFacade.listBrowserAccountSessions;
export const reauthenticateSession =
  authenticationServerFacade.reauthenticateSession;
export const removeAccountSession =
  authenticationServerFacade.removeAccountSession;
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
