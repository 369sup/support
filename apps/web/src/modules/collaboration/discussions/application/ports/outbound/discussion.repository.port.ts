import type { RepositoryDiscussion } from "../../../domain/repository-discussion";

export interface DiscussionRepositoryPort {
  findByRepositoryAndNumber(
    repositoryId: string,
    number: number,
  ): Promise<RepositoryDiscussion | null>;
  insert(discussion: RepositoryDiscussion): Promise<void>;
  listByRepository(
    repositoryId: string,
  ): Promise<readonly RepositoryDiscussion[]>;
  nextNumber(repositoryId: string): Promise<number>;
}
