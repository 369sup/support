import type {
  SqlExecutor,
  SqlRow,
  TransactionalSqlExecutor,
} from "@support/database/postgres";
import type {
  EnterpriseTeamOrganizationMembershipSynchronization,
  OrganizationInvitationSnapshot,
  OrganizationMembershipQueryRepositoryPort,
  OrganizationMembershipQuerySnapshot,
} from "../../../application/ports/outbound/organization-membership-query.repository.port";

type MembershipRow = SqlRow & {
  membership_id: string;
  organization_id: string;
  account_id: string;
  role: OrganizationMembershipQuerySnapshot["role"];
  state: OrganizationMembershipQuerySnapshot["state"];
  source: OrganizationMembershipQuerySnapshot["source"];
};
type InvitationRow = SqlRow & {
  invitation_id: string;
  membership_id: string;
  organization_id: string;
  account_id: string;
  inviter_account_id: string;
  role: OrganizationInvitationSnapshot["role"];
  state: OrganizationInvitationSnapshot["state"];
  created_at: Date | string;
  expires_at: Date | string;
  decided_at: Date | string | null;
};

const membershipColumns =
  "membership_id, organization_id, account_id, role, state, source";
const invitationColumns =
  "invitation_id, membership_id, organization_id, account_id, inviter_account_id, role, state, created_at, expires_at, decided_at";

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
function mapMembership(row: MembershipRow): OrganizationMembershipQuerySnapshot {
  return {
    membershipId: row.membership_id,
    organizationId: row.organization_id,
    accountId: row.account_id,
    role: row.role,
    state: row.state,
    source: row.source,
  };
}
function mapInvitation(row: InvitationRow): OrganizationInvitationSnapshot {
  return {
    invitationId: row.invitation_id,
    membershipId: row.membership_id,
    organizationId: row.organization_id,
    accountId: row.account_id,
    inviterAccountId: row.inviter_account_id,
    role: row.role,
    state: row.state,
    createdAt: iso(row.created_at),
    expiresAt: iso(row.expires_at),
    decidedAt: row.decided_at === null ? null : iso(row.decided_at),
  };
}

async function upsertMembership(
  database: SqlExecutor,
  membership: OrganizationMembershipQuerySnapshot,
): Promise<void> {
  await database.query(
    `insert into support_organization_memberships (
       membership_id, organization_id, account_id, role, state, source
     ) values ($1, $2, $3, $4, $5, $6)
     on conflict (organization_id, account_id) do update set
       membership_id = excluded.membership_id,
       role = excluded.role,
       state = excluded.state,
       source = excluded.source`,
    [
      membership.membershipId,
      membership.organizationId,
      membership.accountId,
      membership.role,
      membership.state,
      membership.source,
    ],
  );
}

export class PostgresOrganizationMembershipAdapter
  implements OrganizationMembershipQueryRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;
  private readonly isSchemaReady: Promise<void>;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
    this.isSchemaReady = this.assertSchema();
  }

  private async assertSchema(): Promise<void> {
    const result = await this.database.query<{ isReady: boolean }>(
      `select exists (
         select 1 from support_schema_migrations
         where migration_id = 'zz030_organizations_organization_memberships'
       ) as "isReady"`,
    );
    if (result.rows[0]?.isReady !== true) {
      throw new Error("Organization membership schema is unavailable.");
    }
  }

  private async memberships(where: string, values: readonly string[]) {
    await this.isSchemaReady;
    const result = await this.database.query<MembershipRow>(
      `select ${membershipColumns} from support_organization_memberships ${where}`,
      values,
    );
    return result.rows.map(mapMembership);
  }

  async findByAccountId(accountId: string) {
    return this.memberships("where account_id = $1 order by organization_id", [
      accountId,
    ]);
  }

  async findByAccountAndOrganization(accountId: string, organizationId: string) {
    const rows = await this.memberships(
      "where account_id = $1 and organization_id = $2 limit 1",
      [accountId, organizationId],
    );
    return rows[0] ?? null;
  }

  async findByOrganizationId(organizationId: string) {
    return this.memberships(
      "where organization_id = $1 order by account_id",
      [organizationId],
    );
  }

  async findByMembershipId(membershipId: string) {
    const rows = await this.memberships("where membership_id = $1 limit 1", [
      membershipId,
    ]);
    return rows[0] ?? null;
  }

  async countActiveOwnersByOrganization(organizationId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<{ owner_count: string | number }>(
      `select count(*) as owner_count
         from support_organization_memberships
        where organization_id = $1 and role = 'owner' and state = 'active'`,
      [organizationId],
    );
    return Number(result.rows[0]?.owner_count ?? 0);
  }

  async saveMembership(membership: OrganizationMembershipQuerySnapshot) {
    await this.isSchemaReady;
    await upsertMembership(this.database, membership);
  }

  private async invitations(where: string, values: readonly string[]) {
    await this.isSchemaReady;
    const result = await this.database.query<InvitationRow>(
      `select ${invitationColumns} from support_organization_invitations ${where}`,
      values,
    );
    return result.rows.map(mapInvitation);
  }

  async findInvitationById(invitationId: string) {
    const rows = await this.invitations("where invitation_id = $1 limit 1", [
      invitationId,
    ]);
    return rows[0] ?? null;
  }

  async findLatestInvitationByAccountAndOrganization(
    accountId: string,
    organizationId: string,
  ) {
    const rows = await this.invitations(
      "where account_id = $1 and organization_id = $2 order by created_at desc limit 1",
      [accountId, organizationId],
    );
    return rows[0] ?? null;
  }

  async listInvitationsByAccount(accountId: string) {
    return this.invitations("where account_id = $1 order by created_at desc", [
      accountId,
    ]);
  }

  async listInvitationsByOrganization(organizationId: string) {
    return this.invitations(
      "where organization_id = $1 order by created_at desc",
      [organizationId],
    );
  }

  async saveInvitationWithMembership(
    invitation: OrganizationInvitationSnapshot,
    membership: OrganizationMembershipQuerySnapshot,
  ) {
    await this.isSchemaReady;
    await this.database.transaction(async (connection) => {
      await upsertMembership(connection, membership);
      await connection.query(
        `insert into support_organization_invitations (
           invitation_id, membership_id, organization_id, account_id,
           inviter_account_id, role, state, created_at, expires_at, decided_at
         ) values (
           $1, $2, $3, $4, $5, $6, $7,
           $8::timestamptz, $9::timestamptz, $10::timestamptz
         )
         on conflict (invitation_id) do update set
           role = excluded.role,
           state = excluded.state,
           expires_at = excluded.expires_at,
           decided_at = excluded.decided_at`,
        [
          invitation.invitationId,
          invitation.membershipId,
          invitation.organizationId,
          invitation.accountId,
          invitation.inviterAccountId,
          invitation.role,
          invitation.state,
          invitation.createdAt,
          invitation.expiresAt,
          invitation.decidedAt,
        ],
      );
    });
  }

  async synchronizeEnterpriseTeamAssignment(
    synchronization: EnterpriseTeamOrganizationMembershipSynchronization,
  ) {
    await this.isSchemaReady;
    return this.database.transaction(async (connection) => {
      await connection.query(
        "select pg_advisory_xact_lock(hashtext($1))",
        [`support-enterprise-assignment:${synchronization.assignmentId}`],
      );
      const generatedIds = new Map(
        synchronization.generatedMembershipIds.map((entry) => [
          entry.accountId,
          entry.membershipId,
        ]),
      );
      const desiredMembershipIds: string[] = [];
      for (const accountId of synchronization.accountIds) {
        const existing = await connection.query<MembershipRow>(
          `select ${membershipColumns} from support_organization_memberships
            where organization_id = $1 and account_id = $2 for update`,
          [synchronization.organizationId, accountId],
        );
        const current = existing.rows[0];
        const membershipId =
          current?.membership_id ?? generatedIds.get(accountId);
        if (membershipId === undefined) {
          throw new Error(
            "Enterprise assignment is missing a generated membership ID.",
          );
        }
        const shouldPreserve =
          current?.state === "active" &&
          current.source !== "enterprise-managed";
        if (!shouldPreserve) {
          await upsertMembership(connection, {
            membershipId,
            organizationId: synchronization.organizationId,
            accountId,
            role: "member",
            state: "active",
            source: "enterprise-managed",
          });
        }
        await connection.query(
          `insert into support_enterprise_team_membership_assignments (
             assignment_id, membership_id
           ) values ($1, $2) on conflict do nothing`,
          [synchronization.assignmentId, membershipId],
        );
        await connection.query(
          `update support_organization_invitations
              set state = 'canceled', decided_at = $3::timestamptz
            where account_id = $1 and organization_id = $2 and state = 'pending'`,
          [
            accountId,
            synchronization.organizationId,
            synchronization.decidedAt,
          ],
        );
        desiredMembershipIds.push(membershipId);
      }

      const desiredPlaceholders = desiredMembershipIds.map(
        (_, index) => `$${index + 2}`,
      );
      const removed = await connection.query<{ membership_id: string }>(
        `delete from support_enterprise_team_membership_assignments
          where assignment_id = $1
            ${
              desiredPlaceholders.length === 0
                ? ""
                : `and membership_id not in (${desiredPlaceholders.join(", ")})`
            }
        returning membership_id`,
        [synchronization.assignmentId, ...desiredMembershipIds],
      );
      for (const row of removed.rows) {
        await connection.query(
          `update support_organization_memberships m
              set state = 'removed'
            where m.membership_id = $1
              and m.source = 'enterprise-managed'
              and not exists (
                select 1 from support_enterprise_team_membership_assignments a
                 where a.membership_id = m.membership_id
              )`,
          [row.membership_id],
        );
      }

      if (desiredMembershipIds.length === 0) {
        return [];
      }
      const result = await connection.query<MembershipRow>(
        `select ${membershipColumns} from support_organization_memberships
          where membership_id in (${desiredMembershipIds
            .map((_, index) => `$${index + 1}`)
            .join(", ")})
          order by account_id`,
        desiredMembershipIds,
      );
      return result.rows.map(mapMembership);
    });
  }
}
