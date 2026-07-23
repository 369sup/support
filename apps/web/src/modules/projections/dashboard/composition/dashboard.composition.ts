import type { AuthenticatedSessionReference } from "@/modules/identity/authentication/integration-contracts";

import { DashboardSourceAdapter } from "../adapters/outbound/integration/dashboard-source.adapter";
import { InMemoryDashboardSelectionAdapter } from "../adapters/outbound/persistence/in-memory-dashboard-selection.adapter";
import { RestoreLastValidDashboardContextHandler } from "../application/commands/restore-last-valid-dashboard-context.handler";
import { SelectDashboardContextHandler } from "../application/commands/select-dashboard-context.handler";
import { GetDashboardRepositoryViewHandler } from "../application/queries/get-dashboard-repository-view.handler";
import { GetSelectedDashboardContextHandler } from "../application/queries/get-selected-dashboard-context.handler";
import { ListAvailableDashboardContextsHandler } from "../application/queries/list-available-dashboard-contexts.handler";
import type {
  AvailableDashboardContext,
  DashboardRepositoryViewResult,
  GetSelectedDashboardContextResult,
  RestoreDashboardContextResult,
  SelectDashboardContextInput,
  SelectDashboardContextResult,
} from "../contracts/dashboard-context";

export interface DashboardServerFacade {
  getDashboardRepositoryView: (
    session: AuthenticatedSessionReference,
  ) => Promise<DashboardRepositoryViewResult>;
  getSelectedDashboardContext: (
    sessionId: string,
  ) => Promise<GetSelectedDashboardContextResult>;
  listAvailableDashboardContexts: (
    session: AuthenticatedSessionReference,
  ) => Promise<readonly AvailableDashboardContext[]>;
  restoreLastValidDashboardContext: (
    session: AuthenticatedSessionReference,
  ) => Promise<RestoreDashboardContextResult>;
  selectDashboardContext: (
    session: AuthenticatedSessionReference,
    target: SelectDashboardContextInput,
  ) => Promise<SelectDashboardContextResult>;
}

function actorFromSession(session: AuthenticatedSessionReference) {
  return {
    sessionId: session.sessionId,
    account: {
      accountId: session.account.accountId,
      username: session.account.username,
      displayName: session.account.displayName,
      lifecycleState: session.account.lifecycleState,
    },
  };
}

function composeDashboardServerFacade(): DashboardServerFacade {
  const selectionRepository = new InMemoryDashboardSelectionAdapter();
  const sourceGateway = new DashboardSourceAdapter();
  const restore = new RestoreLastValidDashboardContextHandler(
    selectionRepository,
    sourceGateway,
  );
  const select = new SelectDashboardContextHandler(
    selectionRepository,
    sourceGateway,
  );
  const getSelected = new GetSelectedDashboardContextHandler(
    selectionRepository,
  );
  const listAvailable = new ListAvailableDashboardContextsHandler(
    sourceGateway,
  );
  const getRepositoryView = new GetDashboardRepositoryViewHandler(
    restore,
    sourceGateway,
  );

  return {
    getDashboardRepositoryView: (session) =>
      getRepositoryView.getDashboardRepositoryView({
        actor: actorFromSession(session),
      }),
    getSelectedDashboardContext: (sessionId) =>
      getSelected.getSelectedDashboardContext({ sessionId }),
    listAvailableDashboardContexts: (session) =>
      listAvailable.listAvailableDashboardContexts({
        actor: actorFromSession(session),
      }),
    restoreLastValidDashboardContext: (session) =>
      restore.restoreLastValidDashboardContext({
        actor: actorFromSession(session),
      }),
    selectDashboardContext: (session, target) =>
      select.selectDashboardContext({
        actor: actorFromSession(session),
        target,
      }),
  };
}

export const dashboardServerFacade =
  composeDashboardServerFacade();
