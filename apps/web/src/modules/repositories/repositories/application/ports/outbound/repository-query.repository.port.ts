export type RepositoryQuerySnapshot = Readonly<{
  repositoryId: string;
  owner: Readonly<{
    kind: "personal" | "organization";
    id: string;
    username: string;
  }>;
  name: string;
  description: string;
  homepage: string;
  visibility: "public" | "private" | "internal";
  lifecycleState: "active" | "archived" | "deleted";
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  restoreUntil: string | null;
}>;

export interface RepositoryQueryRepositoryPort {
  findByOwnerId(ownerId: string): Promise<readonly RepositoryQuerySnapshot[]>;
  findByOwnerIdAndName(
    ownerId: string,
    name: string,
  ): Promise<RepositoryQuerySnapshot | null>;
  save(repository: RepositoryQuerySnapshot): Promise<void>;
}
