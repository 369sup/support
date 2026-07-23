export type DashboardContext =
  | Readonly<{
      kind: "personal";
      accountId: string;
      login: string;
      displayName: string;
    }>
  | Readonly<{
      kind: "organization";
      organizationId: string;
      login: string;
      displayName: string;
      relationship: "member" | "owner";
    }>;

export type AvailableDashboardContext = DashboardContext;

export type SelectDashboardContextInput =
  | Readonly<{ kind: "personal"; id: string }>
  | Readonly<{ kind: "organization"; id: string }>;

export type SelectDashboardContextResult =
  | Readonly<{ status: "selected"; context: DashboardContext }>
  | Readonly<{
      status: "context-not-available" | "cross-account-context";
    }>;

export type GetSelectedDashboardContextResult =
  | Readonly<{ status: "found"; context: DashboardContext }>
  | Readonly<{ status: "context-not-selected" }>;

export type RestoreDashboardContextResult = Readonly<{
  status: "restored" | "fallback-selected";
  context: DashboardContext;
}>;

export type DashboardRepositoryView = Readonly<{
  repositoryId: string;
  ownerLogin: string;
  name: string;
  description: string;
  visibility: "public" | "private" | "internal";
  permission: "read" | "triage" | "write" | "maintain" | "admin";
  updatedAt: string;
}>;

export type DashboardRepositoryViewResult = Readonly<{
  context: DashboardContext;
  repositories: readonly DashboardRepositoryView[];
}>;
