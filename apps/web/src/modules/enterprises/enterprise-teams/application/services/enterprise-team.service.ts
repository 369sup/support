import type {
  AddEnterpriseTeamMemberCommand,
  AddEnterpriseTeamMemberResult,
} from "../ports/inbound/add-enterprise-team-member.use-case";
import type {
  CreateEnterpriseTeamCommand,
  CreateEnterpriseTeamResult,
} from "../ports/inbound/create-enterprise-team.use-case";
import type {
  DeleteEnterpriseTeamCommand,
  DeleteEnterpriseTeamResult,
} from "../ports/inbound/delete-enterprise-team.use-case";
import type {
  ListEnterpriseTeamMembersQuery,
  ListEnterpriseTeamMembersResult,
} from "../ports/inbound/list-enterprise-team-members.use-case";
import type {
  ListEnterpriseTeamsQuery,
  ListEnterpriseTeamsResult,
} from "../ports/inbound/list-enterprise-teams.use-case";
import type {
  RemoveEnterpriseTeamMemberCommand,
  RemoveEnterpriseTeamMemberResult,
} from "../ports/inbound/remove-enterprise-team-member.use-case";
import type {
  UpdateEnterpriseTeamCommand,
  UpdateEnterpriseTeamResult,
} from "../ports/inbound/update-enterprise-team.use-case";
import type {
  AssignEnterpriseTeamToOrganizationCommand,
  AssignEnterpriseTeamToOrganizationResult,
} from "../ports/inbound/assign-enterprise-team-to-organization.use-case";
import type {
  ListEnterpriseTeamOrganizationAssignmentsQuery,
  ListEnterpriseTeamOrganizationAssignmentsResult,
} from "../ports/inbound/list-enterprise-team-organization-assignments.use-case";
import type {
  UnassignEnterpriseTeamFromOrganizationCommand,
  UnassignEnterpriseTeamFromOrganizationResult,
} from "../ports/inbound/unassign-enterprise-team-from-organization.use-case";
import type { AccountReferenceGatewayPort } from "../ports/outbound/account-reference.gateway.port";
import type { EnterpriseAdministrationGatewayPort } from "../ports/outbound/enterprise-administration.gateway.port";
import type { EnterpriseReferenceGatewayPort } from "../ports/outbound/enterprise-reference.gateway.port";
import type { EnterpriseTeamIdGeneratorPort } from "../ports/outbound/enterprise-team-id-generator.port";
import type { EnterpriseTeamRepositoryPort } from "../ports/outbound/enterprise-team.repository.port";
import type { OrganizationMembershipGatewayPort } from "../ports/outbound/organization-membership.gateway.port";
import type { OrganizationPolicyGatewayPort } from "../ports/outbound/organization-policy.gateway.port";
import type { OrganizationReferenceGatewayPort } from "../ports/outbound/organization-reference.gateway.port";
import {
  createEnterpriseTeamSlug,
  type EnterpriseTeamReference,
} from "../../domain/enterprise-team";

const enterpriseTeamListLimit = 100;
const enterpriseTeamMemberListLimit = 100;
const maximumEnterpriseTeams = 2_500;
const maximumEnterpriseTeamMembers = 5_000;
const maximumEnterpriseTeamNameLength = 100;
const maximumEnterpriseTeamDescriptionLength = 280;
const maximumEnterpriseTeamOrganizationAssignments = 1_000;

type EnterpriseAccess =
  | Readonly<{
      status: "allowed";
      enterpriseId: string;
    }>
  | Readonly<{
      status: "enterprise-not-found" | "permission-denied";
    }>;

export class EnterpriseTeamService {
  private readonly repository: EnterpriseTeamRepositoryPort;
  private readonly enterpriseGateway: EnterpriseReferenceGatewayPort;
  private readonly administrationGateway: EnterpriseAdministrationGatewayPort;
  private readonly accountGateway: AccountReferenceGatewayPort;
  private readonly organizationGateway: OrganizationReferenceGatewayPort;
  private readonly organizationMembershipGateway: OrganizationMembershipGatewayPort;
  private readonly organizationPolicyGateway: OrganizationPolicyGatewayPort;
  private readonly idGenerator: EnterpriseTeamIdGeneratorPort;

  constructor(
    repository: EnterpriseTeamRepositoryPort,
    enterpriseGateway: EnterpriseReferenceGatewayPort,
    administrationGateway: EnterpriseAdministrationGatewayPort,
    accountGateway: AccountReferenceGatewayPort,
    organizationGateway: OrganizationReferenceGatewayPort,
    organizationMembershipGateway: OrganizationMembershipGatewayPort,
    organizationPolicyGateway: OrganizationPolicyGatewayPort,
    idGenerator: EnterpriseTeamIdGeneratorPort,
  ) {
    this.repository = repository;
    this.enterpriseGateway = enterpriseGateway;
    this.administrationGateway = administrationGateway;
    this.accountGateway = accountGateway;
    this.organizationGateway = organizationGateway;
    this.organizationMembershipGateway = organizationMembershipGateway;
    this.organizationPolicyGateway = organizationPolicyGateway;
    this.idGenerator = idGenerator;
  }

  async create(
    command: CreateEnterpriseTeamCommand,
  ): Promise<CreateEnterpriseTeamResult> {
    const access = await this.resolveAccess(
      command.actorAccountId,
      command.enterpriseSlug,
      "manage",
    );
    if (access.status !== "allowed") {
      return access;
    }

    const normalized = this.normalizeTeamProfile(
      command.name,
      command.description,
    );
    if (normalized === null) {
      return { status: "invalid-name" };
    }
    if (
      (await this.repository.countActiveTeamsByEnterprise(
        access.enterpriseId,
      )) >= maximumEnterpriseTeams
    ) {
      return { status: "team-limit-reached" };
    }
    if (
      (await this.repository.findTeamByEnterpriseAndSlug(
        access.enterpriseId,
        normalized.slug,
      ))?.lifecycleState === "active"
    ) {
      return { status: "team-slug-conflict" };
    }

    const team: EnterpriseTeamReference = {
      teamId: this.idGenerator.nextId("team"),
      enterpriseId: access.enterpriseId,
      name: normalized.name,
      slug: normalized.slug,
      description: normalized.description,
      lifecycleState: "active",
    };
    await this.repository.saveTeam(team);
    return { status: "created", team };
  }

  async list(
    query: ListEnterpriseTeamsQuery,
  ): Promise<ListEnterpriseTeamsResult> {
    const access = await this.resolveAccess(
      query.actorAccountId,
      query.enterpriseSlug,
      "view",
    );
    if (access.status !== "allowed") {
      return access;
    }

    return {
      status: "found",
      teams: await this.repository.listActiveTeamsByEnterprise(
        access.enterpriseId,
        enterpriseTeamListLimit,
      ),
    };
  }

  async update(
    command: UpdateEnterpriseTeamCommand,
  ): Promise<UpdateEnterpriseTeamResult> {
    const access = await this.resolveAccess(
      command.actorAccountId,
      command.enterpriseSlug,
      "manage",
    );
    if (access.status !== "allowed") {
      return access;
    }
    const team = await this.findActiveTeam(
      command.teamId,
      access.enterpriseId,
    );
    if (team === null) {
      return { status: "team-not-found" };
    }

    const normalized = this.normalizeTeamProfile(
      command.name,
      command.description,
    );
    if (normalized === null) {
      return { status: "invalid-name" };
    }
    const slugOwner =
      await this.repository.findTeamByEnterpriseAndSlug(
        access.enterpriseId,
        normalized.slug,
      );
    if (
      slugOwner !== null &&
      slugOwner.lifecycleState === "active" &&
      slugOwner.teamId !== team.teamId
    ) {
      return { status: "team-slug-conflict" };
    }

    const updated: EnterpriseTeamReference = {
      ...team,
      name: normalized.name,
      slug: normalized.slug,
      description: normalized.description,
    };
    await this.repository.saveTeam(updated);
    return { status: "updated", team: updated };
  }

  async delete(
    command: DeleteEnterpriseTeamCommand,
  ): Promise<DeleteEnterpriseTeamResult> {
    const access = await this.resolveAccess(
      command.actorAccountId,
      command.enterpriseSlug,
      "manage",
    );
    if (access.status !== "allowed") {
      return access;
    }
    const team = await this.findActiveTeam(
      command.teamId,
      access.enterpriseId,
    );
    if (team === null) {
      return { status: "team-not-found" };
    }

    const deleted: EnterpriseTeamReference = {
      ...team,
      lifecycleState: "deleted",
    };
    const organizationGrants =
      await this.repository.listActiveOrganizationGrantsByTeam(team.teamId);
    for (const grant of organizationGrants) {
      await this.organizationMembershipGateway.synchronizeEnterpriseTeamAssignment(
        {
          assignmentId: grant.grantId,
          organizationId: grant.organizationId,
          accountIds: [],
        },
      );
      await this.repository.saveOrganizationGrant({
        ...grant,
        state: "revoked",
      });
    }
    await this.repository.saveTeam(deleted);
    return { status: "deleted", team: deleted };
  }

  async addMember(
    command: AddEnterpriseTeamMemberCommand,
  ): Promise<AddEnterpriseTeamMemberResult> {
    const access = await this.resolveAccess(
      command.actorAccountId,
      command.enterpriseSlug,
      "manage",
    );
    if (access.status !== "allowed") {
      return access;
    }
    const team = await this.findActiveTeam(
      command.teamId,
      access.enterpriseId,
    );
    if (team === null) {
      return { status: "team-not-found" };
    }
    const account = await this.accountGateway.getActiveAccountByUsername(
      command.username.trim(),
    );
    if (account === null) {
      return { status: "account-not-found" };
    }
    if (
      (await this.repository.findActiveMembership(
        team.teamId,
        account.accountId,
      )) !== null
    ) {
      return { status: "already-team-member" };
    }
    if (
      (await this.repository.countActiveMembershipsByTeam(team.teamId)) >=
      maximumEnterpriseTeamMembers
    ) {
      return { status: "team-member-limit-reached" };
    }

    const membership = {
      teamMembershipId: this.idGenerator.nextId("membership"),
      teamId: team.teamId,
      enterpriseId: team.enterpriseId,
      accountId: account.accountId,
      state: "active" as const,
    };
    await this.repository.saveMembership(membership);
    try {
      await this.synchronizeActiveOrganizationAssignments(team.teamId);
    } catch (error: unknown) {
      await this.repository.saveMembership({
        ...membership,
        state: "removed",
      });
      throw error;
    }
    return { status: "added", membership, account };
  }

  async removeMember(
    command: RemoveEnterpriseTeamMemberCommand,
  ): Promise<RemoveEnterpriseTeamMemberResult> {
    const access = await this.resolveAccess(
      command.actorAccountId,
      command.enterpriseSlug,
      "manage",
    );
    if (access.status !== "allowed") {
      return access;
    }
    const team = await this.findActiveTeam(
      command.teamId,
      access.enterpriseId,
    );
    if (team === null) {
      return { status: "team-not-found" };
    }
    const membership = await this.repository.findActiveMembership(
      team.teamId,
      command.accountId,
    );
    if (membership === null) {
      return { status: "membership-not-found" };
    }

    const removed = { ...membership, state: "removed" as const };
    await this.repository.saveMembership(removed);
    try {
      await this.synchronizeActiveOrganizationAssignments(team.teamId);
    } catch (error: unknown) {
      await this.repository.saveMembership(membership);
      throw error;
    }
    return { status: "removed", membership: removed };
  }

  async listMembers(
    query: ListEnterpriseTeamMembersQuery,
  ): Promise<ListEnterpriseTeamMembersResult> {
    const access = await this.resolveAccess(
      query.actorAccountId,
      query.enterpriseSlug,
      "view",
    );
    if (access.status !== "allowed") {
      return access;
    }
    const team = await this.findActiveTeam(
      query.teamId,
      access.enterpriseId,
    );
    if (team === null) {
      return { status: "team-not-found" };
    }
    const memberships =
      await this.repository.listActiveMembershipsByTeam(
        team.teamId,
        enterpriseTeamMemberListLimit,
      );
    const resolvedAccounts = await Promise.all(
      memberships.map((membership) =>
        this.accountGateway.getActiveAccountById(membership.accountId),
      ),
    );
    return {
      status: "found",
      members: memberships.flatMap((membership, membershipIndex) => {
        const account = resolvedAccounts[membershipIndex];
        return account === null || account === undefined
          ? []
          : [{ membership, account }];
      }),
    };
  }

  async assignToOrganization(
    command: AssignEnterpriseTeamToOrganizationCommand,
  ): Promise<AssignEnterpriseTeamToOrganizationResult> {
    const access = await this.resolveAccess(
      command.actorAccountId,
      command.enterpriseSlug,
      "manage",
    );
    if (access.status !== "allowed") {
      return access;
    }
    const team = await this.findActiveTeam(
      command.teamId,
      access.enterpriseId,
    );
    if (team === null) {
      return { status: "team-not-found" };
    }
    const organization =
      await this.organizationGateway.getActiveOrganizationInEnterprise(
        command.enterpriseSlug,
        command.organizationId,
      );
    if (organization === null) {
      return { status: "organization-not-found" };
    }
    if (
      (await this.repository.findActiveOrganizationGrant(
        team.teamId,
        organization.organizationId,
      )) !== null
    ) {
      return { status: "already-assigned" };
    }
    if (
      (await this.repository.countActiveOrganizationGrantsByTeam(
        team.teamId,
      )) >= maximumEnterpriseTeamOrganizationAssignments
    ) {
      return { status: "organization-assignment-limit-reached" };
    }

    const grant = {
      grantId: this.idGenerator.nextId("organization-grant"),
      teamId: team.teamId,
      enterpriseId: team.enterpriseId,
      organizationId: organization.organizationId,
      state: "active" as const,
    };
    const teamMemberships =
      await this.repository.listActiveMembershipsByTeam(
        team.teamId,
        maximumEnterpriseTeamMembers,
      );
    const memberships =
      await this.organizationMembershipGateway.synchronizeEnterpriseTeamAssignment(
        {
          assignmentId: grant.grantId,
          organizationId: organization.organizationId,
          accountIds: teamMemberships.map(
            (membership) => membership.accountId,
          ),
        },
      );
    try {
      await this.repository.saveOrganizationGrant(grant);
    } catch (error: unknown) {
      await this.organizationMembershipGateway.synchronizeEnterpriseTeamAssignment(
        {
          assignmentId: grant.grantId,
          organizationId: organization.organizationId,
          accountIds: [],
        },
      );
      throw error;
    }
    const baseRepositoryPermission =
      await this.organizationPolicyGateway.getBaseRepositoryPermission(
        organization.organizationId,
      );
    return {
      status: "assigned",
      assignment: {
        grant,
        organization,
        baseRepositoryPermission,
      },
      memberships,
    };
  }

  async unassignFromOrganization(
    command: UnassignEnterpriseTeamFromOrganizationCommand,
  ): Promise<UnassignEnterpriseTeamFromOrganizationResult> {
    const access = await this.resolveAccess(
      command.actorAccountId,
      command.enterpriseSlug,
      "manage",
    );
    if (access.status !== "allowed") {
      return access;
    }
    const team = await this.findActiveTeam(
      command.teamId,
      access.enterpriseId,
    );
    if (team === null) {
      return { status: "team-not-found" };
    }
    const grant = await this.repository.findActiveOrganizationGrant(
      team.teamId,
      command.organizationId,
    );
    if (grant === null) {
      return { status: "assignment-not-found" };
    }
    const revokedGrant = { ...grant, state: "revoked" as const };
    await this.repository.saveOrganizationGrant(revokedGrant);
    try {
      await this.organizationMembershipGateway.synchronizeEnterpriseTeamAssignment(
        {
          assignmentId: grant.grantId,
          organizationId: grant.organizationId,
          accountIds: [],
        },
      );
    } catch (error: unknown) {
      await this.repository.saveOrganizationGrant(grant);
      throw error;
    }
    return { status: "unassigned", grant: revokedGrant };
  }

  async listOrganizationAssignments(
    query: ListEnterpriseTeamOrganizationAssignmentsQuery,
  ): Promise<ListEnterpriseTeamOrganizationAssignmentsResult> {
    const access = await this.resolveAccess(
      query.actorAccountId,
      query.enterpriseSlug,
      "view",
    );
    if (access.status !== "allowed") {
      return access;
    }
    const team = await this.findActiveTeam(
      query.teamId,
      access.enterpriseId,
    );
    if (team === null) {
      return { status: "team-not-found" };
    }
    const grants =
      await this.repository.listActiveOrganizationGrantsByTeam(team.teamId);
    const assignments = await Promise.all(
      grants.map(async (grant) => {
        const [organization, baseRepositoryPermission] = await Promise.all([
          this.organizationGateway.getActiveOrganizationInEnterprise(
            query.enterpriseSlug,
            grant.organizationId,
          ),
          this.organizationPolicyGateway.getBaseRepositoryPermission(
            grant.organizationId,
          ),
        ]);
        return organization === null
          ? null
          : { grant, organization, baseRepositoryPermission };
      }),
    );
    return {
      status: "found",
      assignments: assignments.filter(
        (assignment) => assignment !== null,
      ),
    };
  }

  private async resolveAccess(
    actorAccountId: string,
    enterpriseSlug: string,
    operation: "manage" | "view",
  ): Promise<EnterpriseAccess> {
    const enterprise =
      await this.enterpriseGateway.getActiveEnterpriseBySlug(
        enterpriseSlug,
      );
    if (enterprise === null) {
      return { status: "enterprise-not-found" };
    }
    const isAllowed =
      operation === "manage"
        ? await this.administrationGateway.canManageEnterpriseTeams(
            actorAccountId,
            enterprise.enterpriseId,
          )
        : await this.administrationGateway.canViewEnterpriseTeams(
            actorAccountId,
            enterprise.enterpriseId,
          );
    return isAllowed
      ? { status: "allowed", enterpriseId: enterprise.enterpriseId }
      : { status: "permission-denied" };
  }

  private async synchronizeActiveOrganizationAssignments(
    teamId: string,
  ): Promise<void> {
    const [grants, memberships] = await Promise.all([
      this.repository.listActiveOrganizationGrantsByTeam(teamId),
      this.repository.listActiveMembershipsByTeam(
        teamId,
        maximumEnterpriseTeamMembers,
      ),
    ]);
    const accountIds = memberships.map(
      (membership) => membership.accountId,
    );
    await Promise.all(
      grants.map((grant) =>
        this.organizationMembershipGateway.synchronizeEnterpriseTeamAssignment(
          {
            assignmentId: grant.grantId,
            organizationId: grant.organizationId,
            accountIds,
          },
        ),
      ),
    );
  }

  private findActiveTeam(
    teamId: string,
    enterpriseId: string,
  ): Promise<EnterpriseTeamReference | null> {
    return this.repository.findTeamById(teamId).then((team) =>
      team !== null &&
      team.enterpriseId === enterpriseId &&
      team.lifecycleState === "active"
        ? team
        : null,
    );
  }

  private normalizeTeamProfile(
    name: string,
    description: string,
  ): Readonly<{
    name: string;
    slug: string;
    description: string;
  }> | null {
    const normalizedName = name.trim();
    const normalizedDescription = description.trim();
    const slug = createEnterpriseTeamSlug(normalizedName);
    if (
      normalizedName.length === 0 ||
      normalizedName.length > maximumEnterpriseTeamNameLength ||
      normalizedDescription.length > maximumEnterpriseTeamDescriptionLength ||
      slug.length === 0
    ) {
      return null;
    }
    return {
      name: normalizedName,
      slug,
      description: normalizedDescription,
    };
  }
}
