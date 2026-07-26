import type { ConversationRepositoryPort } from "../../../application/ports/outbound/conversation.repository.port";
import type {
  ConversationComment,
  ConversationReaction,
  ConversationSubjectKind,
} from "../../../contracts/conversation-comment";

type ConversationStore = Readonly<{
  comments: Map<string, ConversationComment>;
  reactions: Set<string>;
  lockedSubjects: Set<string>;
}>;

declare global {
  var __supportConversationStoreV1: ConversationStore | undefined;
}

function createStore(): ConversationStore {
  const issueFixture: ConversationComment = {
    commentId: "comment_1",
    subjectKind: "issue",
    subjectId: "repository_support_issue_1",
    authorAccountId: "account_mock",
    authorUsername: "mock",
    body: "The inbox should explain why each notification was created.",
    createdAt: "2026-07-24T11:00:00.000Z",
    reactions: { "thumbs-up": 1, heart: 0, hooray: 0, eyes: 0 },
  };
  const discussionFixture: ConversationComment = {
    commentId: "comment_discussion_1",
    subjectKind: "discussion",
    subjectId: "repository_support_discussion_1",
    authorAccountId: "account_mock",
    authorUsername: "mock",
    body: "Watchers should receive subscribed activity, while participants and mentions explain their own notification reasons.",
    createdAt: "2026-07-24T13:00:00.000Z",
    reactions: { "thumbs-up": 0, heart: 1, hooray: 0, eyes: 0 },
  };
  return {
    comments: new Map([
      [issueFixture.commentId, issueFixture],
      [discussionFixture.commentId, discussionFixture],
    ]),
    reactions: new Set(["comment_1:account_octocat:thumbs-up"]),
    lockedSubjects: new Set(),
  };
}

function getProcessStore(): ConversationStore {
  globalThis.__supportConversationStoreV1 ??= createStore();
  return globalThis.__supportConversationStoreV1;
}

function reactionKey(
  commentId: string,
  actorAccountId: string,
  reaction: ConversationReaction,
): string {
  return `${commentId}:${actorAccountId}:${reaction}`;
}

export class InMemoryConversationAdapter
  implements ConversationRepositoryPort
{
  private readonly store: ConversationStore;

  constructor(store: ConversationStore = getProcessStore()) {
    this.store = store;
  }

  listComments(
    subjectKind: ConversationSubjectKind,
    subjectId: string,
  ): Promise<readonly ConversationComment[]> {
    return Promise.resolve(
      [...this.store.comments.values()].filter(
        (comment) =>
          comment.subjectKind === subjectKind && comment.subjectId === subjectId,
      ),
    );
  }

  isLocked(
    subjectKind: ConversationSubjectKind,
    subjectId: string,
  ): Promise<boolean> {
    return Promise.resolve(
      this.store.lockedSubjects.has(`${subjectKind}:${subjectId}`),
    );
  }

  nextCommentId(subjectId: string): Promise<string> {
    const count = [...this.store.comments.values()].filter(
      (comment) => comment.subjectId === subjectId,
    ).length;
    return Promise.resolve(`comment_${this.store.comments.size + count + 1}`);
  }

  insertComment(comment: ConversationComment): Promise<void> {
    this.store.comments.set(comment.commentId, comment);
    return Promise.resolve();
  }

  findComment(
    subjectId: string,
    commentId: string,
  ): Promise<ConversationComment | null> {
    const comment = this.store.comments.get(commentId);
    return Promise.resolve(
      comment?.subjectId === subjectId ? comment : null,
    );
  }

  hasReaction(
    commentId: string,
    actorAccountId: string,
    reaction: ConversationReaction,
  ): Promise<boolean> {
    return Promise.resolve(
      this.store.reactions.has(
        reactionKey(commentId, actorAccountId, reaction),
      ),
    );
  }

  addReaction(
    comment: ConversationComment,
    actorAccountId: string,
    reaction: ConversationReaction,
  ): Promise<ConversationComment> {
    this.store.reactions.add(
      reactionKey(comment.commentId, actorAccountId, reaction),
    );
    const updated = {
      ...comment,
      reactions: {
        ...comment.reactions,
        [reaction]: comment.reactions[reaction] + 1,
      },
    };
    this.store.comments.set(comment.commentId, updated);
    return Promise.resolve(updated);
  }
}
