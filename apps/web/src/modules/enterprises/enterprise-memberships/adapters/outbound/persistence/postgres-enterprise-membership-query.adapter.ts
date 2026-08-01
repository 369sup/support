import type { SqlExecutor, SqlRow } from "@support/database/postgres";
import type {
  EnterpriseMembershipQueryRepositoryPort,
  EnterpriseMembershipQuerySnapshot,
} from "../../../application/ports/outbound/enterprise-membership-query.repository.port";

type EnterpriseMembershipRow = SqlRow & {
  membership_id: string;
  enterprise_id: string;
  account_id: string;
  affiliation: EnterpriseMembershipQuerySnapshot["affiliation"];
  state: EnterpriseMembershipQuerySnapshot["state"];
};

export class PostgresEnterpriseMembershipQueryAdapter
  implements EnterpriseMembershipQueryRepositoryPort
{
  private readonly database: SqlExecutor;

  constructor(database: SqlExecutor) {
    this.database = database;
  }

  async findByAccountId(accountId: string) {
    const result = await this.database.query<EnterpriseMembershipRow>(
      `select membership_id, enterprise_id, account_id, affiliation, state
         from support_enterprise_memberships
        where account_id = $1 order by enterprise_id`,
      [accountId],
    );
    return result.rows.map((row) => ({
      membershipId: row.membership_id,
      enterpriseId: row.enterprise_id,
      accountId: row.account_id,
      affiliation: row.affiliation,
      state: row.state,
    }));
  }
}
