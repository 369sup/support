import { dashboardServerFacade } from "./composition/dashboard.composition";

export type {
  AvailableDashboardContext,
  DashboardContext,
  DashboardRepositoryView,
  DashboardRepositoryViewResult,
  GetSelectedDashboardContextResult,
  RestoreDashboardContextResult,
  SelectDashboardContextInput,
  SelectDashboardContextResult,
} from "./contracts/dashboard-context";

export const getDashboardRepositoryView =
  dashboardServerFacade.getDashboardRepositoryView;
export const getSelectedDashboardContext =
  dashboardServerFacade.getSelectedDashboardContext;
export const listAvailableDashboardContexts =
  dashboardServerFacade.listAvailableDashboardContexts;
export const restoreLastValidDashboardContext =
  dashboardServerFacade.restoreLastValidDashboardContext;
export const selectDashboardContext =
  dashboardServerFacade.selectDashboardContext;
