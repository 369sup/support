export type RepositoryAccessTarget = Readonly<{
  repositoryId: string;
  owner:
    | Readonly<{ kind: "personal"; accountId: string }>
    | Readonly<{ kind: "organization"; organizationId: string }>;
  visibility: "public" | "private" | "internal";
  lifecycleState: "active" | "archived" | "deleted";
}>;

export type ActiveRepositoryAccessTarget = RepositoryAccessTarget &
  Readonly<{ lifecycleState: "active" }>;
