import type { SqlExecutor, SqlRow } from "@support/database/postgres";

import type { OrganizationRoleAssignmentRepositoryPort } from "../../../application/ports/outbound/organization-role-assignment.repository.port";
import type {
  OrganizationRoleAssignmentReference,
  PredefinedOrganizationRoleKey,
} from "../../../domain/organization-role";

type AssignmentRow = SqlRow & {
  assignment_id: string;
  organization_id: string;
  role_key: PredefinedOrganizationRoleKey;
  subject_kind: "account" | "team";
  subject_id: string;
  state: "active" | "revoked";
};

const columns =
  "assignment_id, organization_id, role_key, subject_kind, subject_id, state";

function mapAssignment(row: AssignmentRow): OrganizationRoleAssignmentReference {
  return {
    assignmentId: row.assignment_id,
    organizationId: row.organization_id,
    roleKey: row.role_key,
    subject:
      row.subject_kind === "account"
        ? { kind: "account", accountId: row.subject_id }
        : { kind: "team", teamId: row.subject_id },
    state: row.state,
  };
}

function parseSubjectKey(subjectKey: string) {
  const separator = subjectKey.indexOf(":");
  if (separator < 1 || separator === subjectKey.length - 1) {
    return null;
  }
  const kind = subjectKey.slice(0, separator);
  if (kind !== "account" && kind !== "team") {
    return null;
  }
  return { kind, id: subjectKey.slice(separator + 1) };
}

export class PostgresOrganizationRoleAssignmentAdapter
  implements OrganizationRoleAssignmentRepositoryPort
{
  private readonly database: SqlExecutor;
  private readonly isSchemaReady: Promise<void>;

  constructor(database: SqlExecutor) {
    this.database = database;
    this.isSchemaReady = this.assertSchema();
  }

  private async assertSchema() {
    const result = await this.database.query<{ isReady: boolean }>(
      `select exists (
         select 1 from support_schema_migrations
         where migration_id = 'zz046_organizations_organization_roles'
       ) as "isReady"`,
    );
    if (result.rows[0]?.isReady !== true) {
      throw new Error("Organization role schema is unavailable.");
    }
  }

  async listByOrganization(organizationId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<AssignmentRow>(
      `select ${columns} from support_organization_role_assignments
        where organization_id = $1 order by assignment_id`,
      [organizationId],
    );
    return result.rows.map(mapAssignment);
  }

  async findById(assignmentId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<AssignmentRow>(
      `select ${columns} from support_organization_role_assignments
        where assignment_id = $1`,
      [assignmentId],
    );
    return result.rows[0] === undefined
      ? null
      : mapAssignment(result.rows[0]);
  }

  async findActiveByOrganizationSubjectAndRole(
    organizationId: string,
    subjectKey: string,
    roleKey: string,
  ) {
    await this.isSchemaReady;
    const subject = parseSubjectKey(subjectKey);
    if (subject === null) {
      return null;
    }
    const result = await this.database.query<AssignmentRow>(
      `select ${columns} from support_organization_role_assignments
        where organization_id = $1
          and subject_kind = $2
          and subject_id = $3
          and role_key = $4
          and state = 'active'`,
      [organizationId, subject.kind, subject.id, roleKey],
    );
    return result.rows[0] === undefined
      ? null
      : mapAssignment(result.rows[0]);
  }

  async save(assignment: OrganizationRoleAssignmentReference) {
    await this.isSchemaReady;
    const subject =
      assignment.subject.kind === "account"
        ? { kind: "account", id: assignment.subject.accountId }
        : { kind: "team", id: assignment.subject.teamId };
    await this.database.query(
      `insert into support_organization_role_assignments (
         assignment_id, organization_id, role_key, subject_kind, subject_id, state
       ) values ($1, $2, $3, $4, $5, $6)
       on conflict (organization_id, subject_kind, subject_id, role_key)
       do update set
         assignment_id = excluded.assignment_id,
         state = excluded.state`,
      [
        assignment.assignmentId,
        assignment.organizationId,
        assignment.roleKey,
        subject.kind,
        subject.id,
        assignment.state,
      ],
    );
  }
}
