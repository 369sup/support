import type { SqlExecutor, SqlRow } from "@support/database/postgres";
import type {
  EnterpriseRoleAssignmentRepositoryPort,
  EnterpriseRoleAssignmentSnapshot,
} from "../../../application/ports/outbound/enterprise-role-assignment.repository.port";

type EnterpriseRoleRow = SqlRow & {
  assignment_id: string;
  enterprise_id: string;
  account_id: string;
  role_name: EnterpriseRoleAssignmentSnapshot["roleName"];
  permissions: EnterpriseRoleAssignmentSnapshot["permissions"];
};

export class PostgresEnterpriseRoleAssignmentAdapter
  implements EnterpriseRoleAssignmentRepositoryPort
{
  private readonly database: SqlExecutor;

  constructor(database: SqlExecutor) {
    this.database = database;
  }

  async findByAccountAndEnterprise(accountId: string, enterpriseId: string) {
    const result = await this.database.query<EnterpriseRoleRow>(
      `select assignment_id, enterprise_id, account_id, role_name, permissions
         from support_enterprise_role_assignments
        where account_id = $1 and enterprise_id = $2
        order by role_name`,
      [accountId, enterpriseId],
    );
    return result.rows.map((row) => ({
      assignmentId: row.assignment_id,
      enterpriseId: row.enterprise_id,
      accountId: row.account_id,
      roleName: row.role_name,
      permissions: row.permissions,
    }));
  }
}
