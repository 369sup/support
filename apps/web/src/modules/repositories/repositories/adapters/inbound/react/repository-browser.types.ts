export type RepositoryBrowserView = Readonly<{
  repositoryId: string;
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
}>;
