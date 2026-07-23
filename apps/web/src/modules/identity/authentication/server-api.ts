import { authenticationServerFacade } from "./composition/authentication.composition";

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
export const expireSession = authenticationServerFacade.expireSession;
export const getCurrentAuthenticatedSession =
  authenticationServerFacade.getCurrentAuthenticatedSession;
export const listBrowserAccountSessions =
  authenticationServerFacade.listBrowserAccountSessions;
export const reauthenticateSession =
  authenticationServerFacade.reauthenticateSession;
export const removeAccountSession =
  authenticationServerFacade.removeAccountSession;
export const signOutAllSessions =
  authenticationServerFacade.signOutAllSessions;
export const switchActiveAccountSession =
  authenticationServerFacade.switchActiveAccountSession;
