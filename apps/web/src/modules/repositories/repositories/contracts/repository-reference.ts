export type RepositoryOwnerReference =
  | Readonly<{
      kind: "personal";
      accountId: string;
      login: string;
    }>
  | Readonly<{
      kind: "organization";
      organizationId: string;
      login: string;
    }>;

export type RepositoryCandidateReference = Readonly<{
  repositoryId: string;
  owner: RepositoryOwnerReference;
  name: string;
  description: string;
  visibility: "public" | "private" | "internal";
  lifecycleState: "active";
  updatedAt: string;
}>;

export type RepositoryLookupResult =
  | Readonly<{
      status: "found";
      repository: RepositoryCandidateReference;
    }>
  | Readonly<{ status: "repository-not-found" }>;
