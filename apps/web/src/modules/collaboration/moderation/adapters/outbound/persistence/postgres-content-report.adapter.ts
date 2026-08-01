import "server-only";

import { randomUUID } from "node:crypto";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { ContentReportRepositoryPort } from "../../../application/ports/outbound/content-report.repository.port";
import type {
  ContentReport,
  ModerationTargetKind,
} from "../../../contracts/content-report";

type ExistsRow = SqlRow & { hasMatch: boolean };

export class PostgresContentReportAdapter
  implements ContentReportRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async hasOpenReport(
    reporterAccountId: string,
    targetKind: ModerationTargetKind,
    targetId: string,
  ): Promise<boolean> {
    const result = await this.database.query<ExistsRow>(
      `
        select exists (
          select 1
          from support_collaboration_moderation.support_content_reports
          where reporter_account_id = $1
            and target_kind = $2
            and target_id = $3
            and status = 'open'
        ) as "hasMatch"
      `,
      [reporterAccountId, targetKind, targetId],
    );
    return result.rows[0]?.hasMatch ?? false;
  }

  nextReportId(): Promise<string> {
    return Promise.resolve(randomUUID());
  }

  async insert(report: ContentReport): Promise<void> {
    await this.database.query(
      `
        insert into support_collaboration_moderation.support_content_reports (
          report_id,
          reporter_account_id,
          target_kind,
          target_id,
          reason,
          status,
          created_at
        ) values ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        report.reportId,
        report.reporterAccountId,
        report.targetKind,
        report.targetId,
        report.reason,
        report.status,
        report.createdAt,
      ],
    );
  }
}
