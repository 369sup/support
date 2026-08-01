import type { SqlExecutor } from "@support/database/postgres";

import type {
  AccountDeletionPrerequisiteGatewayPort,
  AccountDeletionPrerequisiteResult,
} from "../../../application/ports/outbound/account-deletion-prerequisite.gateway.port";

export class PostgresAccountDeletionPrerequisiteAdapter
  implements AccountDeletionPrerequisiteGatewayPort
{
  private readonly database: SqlExecutor;

  constructor(database: SqlExecutor) {
    this.database = database;
  }

  async checkAccountDeletionPrerequisites(
    accountId: string,
  ): Promise<AccountDeletionPrerequisiteResult> {
    const result = await this.database.query<{
      hasEnterpriseOwnership: boolean;
      hasOrganizationOwnership: boolean;
      hasRepositoryOwnership: boolean;
    }>(
      `select
         exists (
           select 1
             from support_repositories_repositories.support_repositories
            where owner_kind = 'personal'
              and owner_id = $1
              and lifecycle_state <> 'deleted'
         ) as "hasRepositoryOwnership",
         exists (
           select 1
             from support_organizations_organization_memberships.support_organization_memberships
            where account_id = $1
              and role = 'owner'
              and state = 'active'
         ) as "hasOrganizationOwnership",
         exists (
           select 1
             from support_enterprises_enterprise_memberships.support_enterprise_memberships
            where account_id = $1
              and role = 'owner'
              and state = 'active'
         ) as "hasEnterpriseOwnership"`,
      [accountId],
    );
    const row = result.rows[0];
    if (row?.hasRepositoryOwnership === true) {
      return "owns-repository";
    }
    if (row?.hasOrganizationOwnership === true) {
      return "owns-organization";
    }
    if (row?.hasEnterpriseOwnership === true) {
      return "owns-enterprise";
    }
    return "allowed";
  }
}
