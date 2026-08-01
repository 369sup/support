import type { DashboardContextSnapshot } from "../../dashboard-snapshot";

export type GetSelectedDashboardContextQuery = Readonly<{
  sessionId: string;
}>;
export type GetSelectedDashboardContextResult =
  | Readonly<{ status: "found"; context: DashboardContextSnapshot }>
  | Readonly<{ status: "context-not-selected" }>;

export interface GetSelectedDashboardContextUseCase {
  getSelectedDashboardContext(
    query: GetSelectedDashboardContextQuery,
  ): Promise<GetSelectedDashboardContextResult>;
}
