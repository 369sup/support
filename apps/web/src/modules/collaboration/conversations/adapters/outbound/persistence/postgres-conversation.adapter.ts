import "server-only";

import { randomUUID } from "node:crypto";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { ConversationRepositoryPort } from "../../../application/ports/outbound/conversation.repository.port";
import type {
  ConversationComment,
  ConversationReaction,
  ConversationSubjectKind,
} from "../../../contracts/conversation-comment";

type CommentRow = SqlRow & {
  author_account_id: string;
  author_username: string;
  body: string;
  comment_id: string;
  created_at: Date | string;
  eyes_count: number;
  heart_count: number;
  hooray_count: number;
  subject_id: string;
  subject_kind: ConversationSubjectKind;
  thumbs_up_count: number;
};

type ExistsRow = SqlRow & {
  hasMatch: boolean;
};

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapComment(row: CommentRow): ConversationComment {
  return {
    commentId: row.comment_id,
    subjectKind: row.subject_kind,
    subjectId: row.subject_id,
    authorAccountId: row.author_account_id,
    authorUsername: row.author_username,
    body: row.body,
    createdAt: toIsoString(row.created_at),
    reactions: {
      "thumbs-up": row.thumbs_up_count,
      heart: row.heart_count,
      hooray: row.hooray_count,
      eyes: row.eyes_count,
    },
  };
}

function reactionColumn(reaction: ConversationReaction): string {
  if (reaction === "thumbs-up") {
    return "thumbs_up_count";
  }
  if (reaction === "heart") {
    return "heart_count";
  }
  if (reaction === "hooray") {
    return "hooray_count";
  }
  return "eyes_count";
}

const commentColumns = `
  comment_id,
  subject_kind,
  subject_id,
  author_account_id,
  author_username,
  body,
  created_at,
  thumbs_up_count,
  heart_count,
  hooray_count,
  eyes_count
`;

export class PostgresConversationAdapter
  implements ConversationRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async listComments(
    subjectKind: ConversationSubjectKind,
    subjectId: string,
  ): Promise<readonly ConversationComment[]> {
    const result = await this.database.query<CommentRow>(
      `
        select ${commentColumns}
        from support_collaboration_conversations.support_conversation_comments
        where subject_kind = $1 and subject_id = $2
        order by created_at, comment_id
      `,
      [subjectKind, subjectId],
    );
    return result.rows.map(mapComment);
  }

  async isLocked(
    subjectKind: ConversationSubjectKind,
    subjectId: string,
  ): Promise<boolean> {
    const result = await this.database.query<ExistsRow>(
      `
        select coalesce((
          select is_locked
          from support_collaboration_conversations.support_conversation_subjects
          where subject_kind = $1 and subject_id = $2
        ), false) as "hasMatch"
      `,
      [subjectKind, subjectId],
    );
    return result.rows[0]?.hasMatch ?? false;
  }

  nextCommentId(): Promise<string> {
    return Promise.resolve(randomUUID());
  }

  async insertComment(comment: ConversationComment): Promise<void> {
    await this.database.query(
      `
        insert into support_collaboration_conversations.support_conversation_comments (
          comment_id,
          subject_kind,
          subject_id,
          author_account_id,
          author_username,
          body,
          created_at,
          thumbs_up_count,
          heart_count,
          hooray_count,
          eyes_count
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        comment.commentId,
        comment.subjectKind,
        comment.subjectId,
        comment.authorAccountId,
        comment.authorUsername,
        comment.body,
        comment.createdAt,
        comment.reactions["thumbs-up"],
        comment.reactions.heart,
        comment.reactions.hooray,
        comment.reactions.eyes,
      ],
    );
  }

  async findComment(
    subjectId: string,
    commentId: string,
  ): Promise<ConversationComment | null> {
    const result = await this.database.query<CommentRow>(
      `
        select ${commentColumns}
        from support_collaboration_conversations.support_conversation_comments
        where subject_id = $1 and comment_id = $2
      `,
      [subjectId, commentId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapComment(row);
  }

  async hasReaction(
    commentId: string,
    actorAccountId: string,
    reaction: ConversationReaction,
  ): Promise<boolean> {
    const result = await this.database.query<ExistsRow>(
      `
        select exists (
          select 1
          from support_collaboration_conversations.support_conversation_reactions
          where comment_id = $1
            and actor_account_id = $2
            and reaction = $3
        ) as "hasMatch"
      `,
      [commentId, actorAccountId, reaction],
    );
    return result.rows[0]?.hasMatch ?? false;
  }

  async addReaction(
    comment: ConversationComment,
    actorAccountId: string,
    reaction: ConversationReaction,
  ): Promise<ConversationComment> {
    return this.database.transaction(async (connection) => {
      const inserted = await connection.query(
        `
          insert into support_collaboration_conversations.support_conversation_reactions (
            comment_id,
            actor_account_id,
            reaction
          ) values ($1, $2, $3)
          on conflict (comment_id, actor_account_id, reaction) do nothing
          returning comment_id
        `,
        [comment.commentId, actorAccountId, reaction],
      );
      if (inserted.rowCount > 0) {
        const column = reactionColumn(reaction);
        await connection.query(
          `
            update support_collaboration_conversations.support_conversation_comments
            set ${column} = ${column} + 1
            where comment_id = $1
          `,
          [comment.commentId],
        );
      }
      const result = await connection.query<CommentRow>(
        `
          select ${commentColumns}
          from support_collaboration_conversations.support_conversation_comments
          where comment_id = $1
        `,
        [comment.commentId],
      );
      const row = result.rows[0];
      if (row === undefined) {
        throw new Error("The conversation comment no longer exists.");
      }
      return mapComment(row);
    });
  }
}
