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
    owner:
      | Readonly<{ kind: "personal"; accountId: string; login: string }>
      | Readonly<{
          kind: "organization";
          organizationId: string;
          login: string;
        }>;
    name: string;
    description: string;
    homepage: string;
    visibility: "public" | "private" | "internal";
    lifecycleState: "active" | "archived";
    permission: "read" | "triage" | "write" | "maintain" | "admin";
    updatedAt: string;
  }>[];
}>;

export interface GetDashboardRepositoryViewUseCase {
  getDashboardRepositoryView(
    query: GetDashboardRepositoryViewQuery,
  ): Promise<GetDashboardRepositoryViewResult>;
}
