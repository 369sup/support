export type RepositoryQuerySnapshot = Readonly<{
  repositoryId: string;
  owner: Readonly<{
    kind: "personal" | "organization";
    id: string;
    username: string;
  }>;
  name: string;
  description: string;
  visibility: "public" | "private" | "internal";
  lifecycleState: "active" | "archived" | "deleted";
  updatedAt: string;
}>;

export interface RepositoryQueryRepositoryPort {
  findByOwnerId(ownerId: string): Promise<readonly RepositoryQuerySnapshot[]>;
}
