import type {
  DashboardActorSnapshot,
  DashboardContextSnapshot,
} from "../../dashboard-snapshot";

export type GetDashboardRepositoryViewQuery = Readonly<{
  actor: DashboardActorSnapshot;
}>;

export type GetDashboardRepositoryViewResult = Readonly<{
  context: DashboardContextSnapshot;
  repositories: readonly Readonly<{
    repositoryId: string;
    ownerLogin: string;
    name: string;
    description: string;
    visibility: "public" | "private" | "internal";
    permission: "read" | "triage" | "write" | "maintain" | "admin";
    updatedAt: string;
  }>[];
}>;

export interface GetDashboardRepositoryViewUseCase {
  getDashboardRepositoryView(
    query: GetDashboardRepositoryViewQuery,
  ): Promise<GetDashboardRepositoryViewResult>;
}
