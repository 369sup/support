import type { DiscussionRepositoryPort } from "../../../application/ports/outbound/discussion.repository.port";
import type { RepositoryDiscussion } from "../../../contracts/repository-discussion";

type DiscussionStore = Map<string, RepositoryDiscussion>;

declare global {
  var __supportDiscussionStoreV1: DiscussionStore | undefined;
}

function key(repositoryId: string, number: number): string {
  return `${repositoryId}:${number}`;
}

function createStore(): DiscussionStore {
  const fixture: RepositoryDiscussion = {
    authorAccountId: "account_octocat",
    authorUsername: "octocat",
    body: "Should watchers receive every issue update, or only participating and mentioned activity?",
    category: "q-and-a",
    createdAt: "2026-07-22T08:00:00.000Z",
    discussionId: "repository_support_discussion_1",
    number: 1,
    repositoryId: "repository_support",
    state: "open",
    title: "How should contributors receive updates?",
    updatedAt: "2026-07-24T13:00:00.000Z",
  };
  return new Map([[key(fixture.repositoryId, fixture.number), fixture]]);
}

function getProcessStore(): DiscussionStore {
  globalThis.__supportDiscussionStoreV1 ??= createStore();
  return globalThis.__supportDiscussionStoreV1;
}

export class InMemoryDiscussionAdapter implements DiscussionRepositoryPort {
  private readonly discussions: DiscussionStore;

  constructor(discussions: DiscussionStore = getProcessStore()) {
    this.discussions = discussions;
  }

  findByRepositoryAndNumber(repositoryId: string, number: number) {
    return Promise.resolve(this.discussions.get(key(repositoryId, number)) ?? null);
  }

  insert(discussion: RepositoryDiscussion) {
    this.discussions.set(
      key(discussion.repositoryId, discussion.number),
      discussion,
    );
    return Promise.resolve();
  }

  listByRepository(repositoryId: string) {
    return Promise.resolve(
      [...this.discussions.values()].filter(
        (discussion) => discussion.repositoryId === repositoryId,
      ),
    );
  }

  async nextNumber(repositoryId: string) {
    const discussions = await this.listByRepository(repositoryId);
    return (
      discussions.reduce(
        (highest, discussion) => Math.max(highest, discussion.number),
        0,
      ) + 1
    );
  }
}
