import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type {
  SearchIndexQuery,
  SearchIndexRepositoryPort,
} from "../../../application/ports/outbound/search-index.repository.port";
import type {
  SearchCandidate,
  SearchDocument,
} from "../../../domain/search-document";

type DocumentRow = SqlRow & {
  authorization_keys: unknown;
  body: string;
  document_id: string;
  kind: string;
  source_context: string;
  source_version: number;
  title: string;
  version: number;
};

type CandidateRow = SqlRow & {
  authorization_keys: unknown;
  document_id: string;
  kind: string;
  score: number;
  source_context: string;
  source_version: number;
  title: string;
};

function parseAuthorizationKeys(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    throw new Error("The stored search authorization keys are invalid.");
  }
  const keys: readonly unknown[] = value;
  return keys.map((key) => {
    if (typeof key !== "string") {
      throw new Error("The stored search authorization keys are invalid.");
    }
    return key;
  });
}

function mapDocument(row: DocumentRow): SearchDocument {
  return {
    authorizationKeys: parseAuthorizationKeys(row.authorization_keys),
    body: row.body,
    documentId: row.document_id,
    kind: row.kind,
    sourceContext: row.source_context,
    sourceVersion: row.source_version,
    title: row.title,
    version: row.version,
  };
}

const documentColumns = `
  document_id,
  kind,
  source_context,
  source_version,
  title,
  body,
  authorization_keys,
  version
`;

export class PostgresSearchIndexAdapter
  implements SearchIndexRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async findById(documentId: string): Promise<SearchDocument | null> {
    const result = await this.database.query<DocumentRow>(
      `
        select ${documentColumns}
        from support_platform_search_index.support_search_documents
        where document_id = $1
      `,
      [documentId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapDocument(row);
  }

  async list(): Promise<readonly SearchDocument[]> {
    const result = await this.database.query<DocumentRow>(
      `
        select ${documentColumns}
        from support_platform_search_index.support_search_documents
        order by document_id
      `,
    );
    return result.rows.map(mapDocument);
  }

  async query(query: SearchIndexQuery): Promise<readonly SearchCandidate[]> {
    const result = await this.database.query<CandidateRow>(
      `
        select
          document_id,
          kind,
          source_context,
          source_version,
          title,
          authorization_keys,
          case
            when lower(title) = $1 then 3
            when lower(title) like '%' || $1 || '%' then 2
            else 1
          end::integer as score
        from support_platform_search_index.support_search_documents
        where (
          search_vector @@ websearch_to_tsquery('simple', $1)
          or lower(title) like '%' || $1 || '%'
          or lower(body) like '%' || $1 || '%'
        )
          and ($2::text is null or kind = $2)
          and (
            $3::text is null
            or authorization_keys ? $3
          )
        order by score desc, title, document_id
        limit $4
      `,
      [
        query.text,
        query.kind ?? null,
        query.authorizationKey ?? null,
        query.limit,
      ],
    );
    return result.rows.map((row) => ({
      authorizationKeys: parseAuthorizationKeys(row.authorization_keys),
      documentId: row.document_id,
      kind: row.kind,
      score: row.score,
      sourceContext: row.source_context,
      sourceVersion: row.source_version,
      title: row.title,
    }));
  }

  async remove(
    documentId: string,
    expectedVersion?: number,
  ): Promise<void> {
    const result = await this.database.query(
      `
        delete from support_platform_search_index.support_search_documents
        where document_id = $1
          and ($2::integer is null or version = $2)
      `,
      [documentId, expectedVersion ?? null],
    );
    if (result.rowCount !== 1) {
      throw new Error("Search index optimistic concurrency check failed.");
    }
  }

  async save(document: SearchDocument): Promise<void> {
    const result = await this.database.query(
      `
        insert into support_platform_search_index.support_search_documents (
          document_id,
          kind,
          source_context,
          source_version,
          title,
          body,
          authorization_keys,
          version
        ) values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
        on conflict (document_id) do update
        set kind = excluded.kind,
            source_context = excluded.source_context,
            source_version = excluded.source_version,
            title = excluded.title,
            body = excluded.body,
            authorization_keys = excluded.authorization_keys,
            version = excluded.version,
            updated_at = now()
        where support_platform_search_index.support_search_documents.version = excluded.version - 1
        returning document_id
      `,
      [
        document.documentId,
        document.kind,
        document.sourceContext,
        document.sourceVersion,
        document.title,
        document.body,
        JSON.stringify(document.authorizationKeys),
        document.version,
      ],
    );
    if (result.rowCount !== 1) {
      throw new Error("Search index optimistic concurrency check failed.");
    }
  }
}
