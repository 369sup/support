import type {
  DashboardActorSnapshot,
  DashboardContextSnapshot,
} from "../../dashboard-snapshot";

export type ListAvailableDashboardContextsQuery = Readonly<{
  actor: DashboardActorSnapshot;
}>;

export interface ListAvailableDashboardContextsUseCase {
  listAvailableDashboardContexts(
    query: ListAvailableDashboardContextsQuery,
  ): Promise<readonly DashboardContextSnapshot[]>;
}
