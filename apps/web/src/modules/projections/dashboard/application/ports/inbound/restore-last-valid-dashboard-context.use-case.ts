import type {
  DashboardActorSnapshot,
  DashboardContextSnapshot,
} from "../../dashboard-snapshot";

export type RestoreLastValidDashboardContextCommand = Readonly<{
  actor: DashboardActorSnapshot;
}>;
export type RestoreLastValidDashboardContextResult = Readonly<{
  status: "restored" | "fallback-selected";
  context: DashboardContextSnapshot;
}>;

export interface RestoreLastValidDashboardContextUseCase {
  restoreLastValidDashboardContext(
    command: RestoreLastValidDashboardContextCommand,
  ): Promise<RestoreLastValidDashboardContextResult>;
}
