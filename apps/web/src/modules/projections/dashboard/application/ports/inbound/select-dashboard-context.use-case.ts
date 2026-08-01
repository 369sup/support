import type {
  DashboardActorSnapshot,
  DashboardContextSnapshot,
} from "../../dashboard-snapshot";

export type SelectDashboardContextCommand = Readonly<{
  actor: DashboardActorSnapshot;
  target:
    | Readonly<{ kind: "personal"; id: string }>
    | Readonly<{ kind: "organization"; id: string }>;
}>;
export type SelectDashboardContextResult =
  | Readonly<{ status: "selected"; context: DashboardContextSnapshot }>
  | Readonly<{
      status: "context-not-available" | "cross-account-context";
    }>;

export interface SelectDashboardContextUseCase {
  selectDashboardContext(
    command: SelectDashboardContextCommand,
  ): Promise<SelectDashboardContextResult>;
}
