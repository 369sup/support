export type RepositoryViewPermission =
  | "read"
  | "triage"
  | "write"
  | "maintain"
  | "admin";

export type RepositoryViewOwner =
  | Readonly<{ kind: "personal"; accountId: string; login: string }>
  | Readonly<{
      kind: "organization";
      organizationId: string;
      login: string;
    }>;

export type RepositoryViewReference = Readonly<{
  repositoryId: string;
  owner: RepositoryViewOwner;
  name: string;
  description: string;
  homepage: string;
  visibility: "public" | "private" | "internal";
  lifecycleState: "active" | "archived";
  permission: RepositoryViewPermission;
  updatedAt: string;
}>;

export type RepositoryListItem = RepositoryViewReference;

export type DeletedRepositoryForRestoration = Readonly<{
  repositoryId: string;
  owner: RepositoryViewOwner;
  name: string;
  deletedAt: string;
  restoreUntil: string;
  isRestorable: boolean;
}>;
