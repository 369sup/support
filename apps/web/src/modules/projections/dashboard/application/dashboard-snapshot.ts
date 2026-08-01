export type DashboardActorSnapshot = Readonly<{
  sessionId: string;
  account: Readonly<{
    accountId: string;
    username: string;
    displayName: string;
    lifecycleState: "active" | "suspended" | "deleted";
  }>;
}>;

export type DashboardContextSnapshot =
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
