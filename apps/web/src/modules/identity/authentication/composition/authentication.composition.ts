import { AccountReferenceAdapter } from "../adapters/outbound/integration/account-reference.adapter";
import { InMemoryBrowserSessionSetAdapter } from "../adapters/outbound/persistence/in-memory-browser-session-set.adapter";
import { InMemoryDevelopmentCredentialAdapter } from "../adapters/outbound/persistence/in-memory-development-credential.adapter";
import { NodeSessionRuntimeAdapter } from "../adapters/outbound/runtime/node-session-runtime.adapter";
import { CreateDevelopmentSessionHandler } from "../application/commands/create-development-session.handler";
import { ExpireSessionHandler } from "../application/commands/expire-session.handler";
import { ReauthenticateSessionHandler } from "../application/commands/reauthenticate-session.handler";
import { RemoveAccountSessionHandler } from "../application/commands/remove-account-session.handler";
import { SignOutAllSessionsHandler } from "../application/commands/sign-out-all-sessions.handler";
import { SwitchActiveAccountSessionHandler } from "../application/commands/switch-active-account-session.handler";
import { GetCurrentAuthenticatedSessionHandler } from "../application/queries/get-current-authenticated-session.handler";
import { ListBrowserAccountSessionsHandler } from "../application/queries/list-browser-account-sessions.handler";
import type {
  CreateDevelopmentSessionResult,
  CurrentSessionResult,
  ExpireSessionResult,
  ListBrowserAccountSessionsResult,
  ReauthenticateSessionResult,
  RemoveAccountSessionResult,
  SwitchAccountSessionResult,
} from "../contracts/authenticated-session-reference";

export interface AuthenticationServerFacade {
  createDevelopmentSession: (input: {
    browserToken: string | null;
    username: string;
    password: string;
  }) => Promise<CreateDevelopmentSessionResult>;
  expireSession: (input: {
    browserToken: string;
    sessionId: string;
  }) => Promise<ExpireSessionResult>;
  getCurrentAuthenticatedSession: (
    browserToken: string,
  ) => Promise<CurrentSessionResult>;
  listBrowserAccountSessions: (
    browserToken: string,
  ) => Promise<ListBrowserAccountSessionsResult>;
  reauthenticateSession: (input: {
    browserToken: string;
    sessionId: string;
    password: string;
  }) => Promise<ReauthenticateSessionResult>;
  removeAccountSession: (input: {
    browserToken: string;
    sessionId: string;
  }) => Promise<RemoveAccountSessionResult>;
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
}

function composeAuthenticationServerFacade(): AuthenticationServerFacade {
  const sessionRepository = new InMemoryBrowserSessionSetAdapter();
  const credentialRepository =
    new InMemoryDevelopmentCredentialAdapter();
  const accountGateway = new AccountReferenceAdapter();
  const runtime = new NodeSessionRuntimeAdapter();

  const create = new CreateDevelopmentSessionHandler(
    sessionRepository,
    credentialRepository,
    accountGateway,
    runtime,
  );
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
  const expire = new ExpireSessionHandler(sessionRepository);
  const reauthenticate = new ReauthenticateSessionHandler(
    sessionRepository,
    credentialRepository,
    accountGateway,
    runtime,
  );

  return {
    createDevelopmentSession: (input) =>
      create.createDevelopmentSession(input),
    expireSession: (input) => expire.expireSession(input),
    getCurrentAuthenticatedSession: (browserToken) =>
      current.getCurrentAuthenticatedSession({ browserToken }),
    listBrowserAccountSessions: (browserToken) =>
      list.listBrowserAccountSessions({ browserToken }),
    reauthenticateSession: (input) =>
      reauthenticate.reauthenticateSession(input),
    removeAccountSession: (input) => remove.removeAccountSession(input),
    signOutAllSessions: (browserToken) =>
      signOut.signOutAllSessions({ browserToken }),
    switchActiveAccountSession: (input) =>
      switchSession.switchActiveAccountSession(input),
  };
}

export const authenticationServerFacade =
  composeAuthenticationServerFacade();
