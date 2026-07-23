import type {
  AddTeamMemberCommand,
  AddTeamMemberResult,
} from "../ports/inbound/add-team-member.use-case";
import type {
  AssignTeamMaintainerCommand,
  AssignTeamMaintainerResult,
} from "../ports/inbound/assign-team-maintainer.use-case";
import type {
  CreateOrganizationTeamCommand,
  CreateOrganizationTeamResult,
} from "../ports/inbound/create-organization-team.use-case";
import type {
  DeleteOrganizationTeamCommand,
  DeleteOrganizationTeamResult,
} from "../ports/inbound/delete-organization-team.use-case";
import type {
  GetOrganizationTeamQuery,
  GetOrganizationTeamResult,
} from "../ports/inbound/get-organization-team.use-case";
import type {
  ListOrganizationTeamsQuery,
  ListOrganizationTeamsResult,
} from "../ports/inbound/list-organization-teams.use-case";
import type {
  ListTeamMembersQuery,
  ListTeamMembersResult,
} from "../ports/inbound/list-team-members.use-case";
import type {
  RemoveTeamMemberCommand,
  RemoveTeamMemberResult,
} from "../ports/inbound/remove-team-member.use-case";
import type {
  ResolveAccountTeamMembershipsQuery,
  ResolveAccountTeamMembershipsResult,
} from "../ports/inbound/resolve-account-team-memberships.use-case";
import type {
  RevokeTeamMaintainerCommand,
  RevokeTeamMaintainerResult,
} from "../ports/inbound/revoke-team-maintainer.use-case";
import type {
  UpdateOrganizationTeamCommand,
  UpdateOrganizationTeamResult,
} from "../ports/inbound/update-organization-team.use-case";
import type {
  OrganizationMembershipGatewayPort,
  OrganizationMembershipSnapshot,
} from "../ports/outbound/organization-membership.gateway.port";
import type { OrganizationReferenceGatewayPort } from "../ports/outbound/organization-reference.gateway.port";
import type { OrganizationTeamRepositoryPort } from "../ports/outbound/organization-team.repository.port";
import type { TeamIdGeneratorPort } from "../ports/outbound/team-id-generator.port";
import type {
  OrganizationTeamReference,
  TeamVisibility,
} from "../../domain/organization-team";
import type { EventRecorderPort } from "@/modules/platform/event-publication/integration-contracts";

export class OrganizationTeamService {
  private readonly repository: OrganizationTeamRepositoryPort;
  private readonly membershipGateway: OrganizationMembershipGatewayPort;
  private readonly organizationGateway: OrganizationReferenceGatewayPort;
  private readonly idGenerator: TeamIdGeneratorPort;
  private readonly eventRecorder: EventRecorderPort | undefined;

  constructor(
    repository: OrganizationTeamRepositoryPort,
    membershipGateway: OrganizationMembershipGatewayPort,
    organizationGateway: OrganizationReferenceGatewayPort,
    idGenerator: TeamIdGeneratorPort,
    eventRecorder?: EventRecorderPort,
  ) {
    this.repository = repository;
    this.membershipGateway = membershipGateway;
    this.organizationGateway = organizationGateway;
    this.idGenerator = idGenerator;
    this.eventRecorder = eventRecorder;
  }

  async create(
    command: CreateOrganizationTeamCommand,
  ): Promise<CreateOrganizationTeamResult> {
    if (
      !(await this.organizationGateway.isActiveOrganization(
        command.organizationId,
      ))
    ) {
      return { status: "organization-not-found" };
    }
    const actorMembership = await this.membershipGateway.getActiveMembership(
      command.actorAccountId,
      command.organizationId,
    );
    if (actorMembership === null) {
      return { status: "membership-inactive" };
    }
    if (actorMembership.role !== "owner") {
      return { status: "permission-denied" };
    }
    if (
      (await this.repository.findTeamByOrganizationAndSlug(
        command.organizationId,
        command.slug,
      ))?.lifecycleState === "active"
    ) {
      return { status: "team-slug-conflict" };
    }
    const parentTeamId = command.parentTeamId ?? null;
    const parentResult = await this.validateParentForCreate(
      command.organizationId,
      command.visibility,
      parentTeamId,
    );
    if (parentResult !== null) {
      return { status: parentResult };
    }
    const team: OrganizationTeamReference = {
      teamId: this.idGenerator.nextId("team"),
      organizationId: command.organizationId,
      name: command.name,
      slug: command.slug,
      description: command.description,
      visibility: command.visibility,
      parentTeamId,
      lifecycleState: "active",
    };
    await this.repository.saveTeam(team);
    await this.recordEvent("OrganizationTeamCreated", team.teamId, {
      organizationId: team.organizationId,
      teamId: team.teamId,
    });
    return { status: "created", team };
  }

  async get(
    query: GetOrganizationTeamQuery,
  ): Promise<GetOrganizationTeamResult> {
    const team = await this.repository.findTeamByOrganizationAndSlug(
      query.organizationId,
      query.teamSlug,
    );
    if (
      team === null ||
      team.lifecycleState !== "active" ||
      !(await this.canViewTeam(query.actorAccountId, team))
    ) {
      return { status: "team-not-found" };
    }
    return { status: "found", team };
  }

  async list(
    query: ListOrganizationTeamsQuery,
  ): Promise<ListOrganizationTeamsResult> {
    const actorMembership = await this.membershipGateway.getActiveMembership(
      query.actorAccountId,
      query.organizationId,
    );
    if (actorMembership === null) {
      return { status: "membership-inactive" };
    }
    const teams = await this.repository.listTeamsByOrganization(
      query.organizationId,
    );
    const visibleTeams = [];
    for (const team of teams) {
      if (
        team.lifecycleState === "active" &&
        (team.visibility === "visible" ||
          actorMembership.role === "owner" ||
          (await this.repository.findActiveMembership(
            team.teamId,
            query.actorAccountId,
          )) !== null)
      ) {
        visibleTeams.push(team);
      }
    }
    return { status: "found", teams: visibleTeams };
  }

  async update(
    command: UpdateOrganizationTeamCommand,
  ): Promise<UpdateOrganizationTeamResult> {
    const team = await this.findActiveTeam(command.teamId);
    if (team === null) {
      return { status: "team-not-found" };
    }
    const actorMembership = await this.membershipGateway.getActiveMembership(
      command.actorAccountId,
      team.organizationId,
    );
    if (actorMembership === null) {
      return { status: "permission-denied" };
    }
    const isHierarchyChange = Object.hasOwn(command, "parentTeamId");
    if (
      isHierarchyChange
        ? actorMembership.role !== "owner"
        : !(await this.canManageTeam(
            command.actorAccountId,
            team,
            actorMembership,
          ))
    ) {
      return { status: "permission-denied" };
    }
    const nextSlug = command.slug ?? team.slug;
    const slugOwner = await this.repository.findTeamByOrganizationAndSlug(
      team.organizationId,
      nextSlug,
    );
    if (
      slugOwner !== null &&
      slugOwner.lifecycleState === "active" &&
      slugOwner.teamId !== team.teamId
    ) {
      return { status: "team-slug-conflict" };
    }
    const nextVisibility = command.visibility ?? team.visibility;
    const nextParentTeamId = Object.hasOwn(command, "parentTeamId")
      ? (command.parentTeamId ?? null)
      : team.parentTeamId;
    const hierarchyError = await this.validateUpdatedHierarchy(
      team,
      nextVisibility,
      nextParentTeamId,
    );
    if (hierarchyError !== null) {
      return { status: hierarchyError };
    }
    const updated: OrganizationTeamReference = {
      ...team,
      name: command.name ?? team.name,
      slug: nextSlug,
      description: command.description ?? team.description,
      visibility: nextVisibility,
      parentTeamId: nextParentTeamId,
    };
    await this.repository.saveTeam(updated);
    await this.recordEvent("OrganizationTeamUpdated", updated.teamId, {
      organizationId: updated.organizationId,
      teamId: updated.teamId,
    });
    if (updated.parentTeamId !== team.parentTeamId) {
      await this.recordEvent("ParentTeamChanged", updated.teamId, {
        parentTeamId: updated.parentTeamId,
        teamId: updated.teamId,
      });
    }
    if (updated.visibility !== team.visibility) {
      await this.recordEvent("TeamVisibilityChanged", updated.teamId, {
        teamId: updated.teamId,
        visibility: updated.visibility,
      });
    }
    return { status: "updated", team: updated };
  }

  async delete(
    command: DeleteOrganizationTeamCommand,
  ): Promise<DeleteOrganizationTeamResult> {
    const team = await this.findActiveTeam(command.teamId);
    if (team === null) {
      return { status: "team-not-found" };
    }
    if (!(await this.isOrganizationOwner(command.actorAccountId, team))) {
      return { status: "permission-denied" };
    }
    for (const child of await this.repository.listActiveChildren(team.teamId)) {
      await this.repository.saveTeam({ ...child, parentTeamId: null });
    }
    const deleted: OrganizationTeamReference = {
      ...team,
      lifecycleState: "deleted",
      parentTeamId: null,
    };
    await this.repository.saveTeam(deleted);
    await this.recordEvent("OrganizationTeamDeleted", deleted.teamId, {
      organizationId: deleted.organizationId,
      teamId: deleted.teamId,
    });
    return { status: "deleted", team: deleted };
  }

  async addMember(
    command: AddTeamMemberCommand,
  ): Promise<AddTeamMemberResult> {
    const team = await this.findActiveTeam(command.teamId);
    if (team === null) {
      return { status: "team-not-found" };
    }
    if (!(await this.canManageTeam(command.actorAccountId, team))) {
      return { status: "permission-denied" };
    }
    if (
      (await this.membershipGateway.getActiveMembership(
        command.targetAccountId,
        team.organizationId,
      )) === null
    ) {
      return { status: "membership-inactive" };
    }
    if (
      (await this.repository.findActiveMembership(
        team.teamId,
        command.targetAccountId,
      )) !== null
    ) {
      return { status: "already-team-member" };
    }
    const membership = {
      teamMembershipId: this.idGenerator.nextId("membership"),
      teamId: team.teamId,
      organizationId: team.organizationId,
      accountId: command.targetAccountId,
      state: "active" as const,
    };
    await this.repository.saveMembership(membership);
    await this.recordEvent("TeamMemberAdded", membership.teamMembershipId, {
      accountId: membership.accountId,
      organizationId: membership.organizationId,
      teamId: membership.teamId,
    });
    return { status: "added", membership };
  }

  async removeMember(
    command: RemoveTeamMemberCommand,
  ): Promise<RemoveTeamMemberResult> {
    const team = await this.findActiveTeam(command.teamId);
    if (team === null) {
      return { status: "team-not-found" };
    }
    if (!(await this.canManageTeam(command.actorAccountId, team))) {
      return { status: "permission-denied" };
    }
    const membership = await this.repository.findActiveMembership(
      team.teamId,
      command.targetAccountId,
    );
    if (membership === null) {
      return { status: "team-member-not-found" };
    }
    const removed = { ...membership, state: "removed" as const };
    await this.repository.saveMembership(removed);
    const maintainer = await this.repository.findActiveMaintainer(
      team.teamId,
      command.targetAccountId,
    );
    if (maintainer !== null) {
      await this.repository.saveMaintainer({
        ...maintainer,
        state: "revoked",
      });
    }
    await this.recordEvent("TeamMemberRemoved", removed.teamMembershipId, {
      accountId: removed.accountId,
      organizationId: removed.organizationId,
      teamId: removed.teamId,
    });
    return { status: "removed", membership: removed };
  }

  async assignMaintainer(
    command: AssignTeamMaintainerCommand,
  ): Promise<AssignTeamMaintainerResult> {
    const team = await this.findActiveTeam(command.teamId);
    if (team === null) {
      return { status: "team-not-found" };
    }
    if (!(await this.isOrganizationOwner(command.actorAccountId, team))) {
      return { status: "permission-denied" };
    }
    if (
      (await this.repository.findActiveMembership(
        team.teamId,
        command.targetAccountId,
      )) === null
    ) {
      return { status: "team-member-not-found" };
    }
    if (
      (await this.repository.findActiveMaintainer(
        team.teamId,
        command.targetAccountId,
      )) !== null
    ) {
      return { status: "already-team-maintainer" };
    }
    const maintainer = {
      teamMaintainerId: this.idGenerator.nextId("maintainer"),
      teamId: team.teamId,
      organizationId: team.organizationId,
      accountId: command.targetAccountId,
      state: "active" as const,
    };
    await this.repository.saveMaintainer(maintainer);
    await this.recordEvent("TeamMaintainerChanged", maintainer.teamMaintainerId, {
      accountId: maintainer.accountId,
      action: "assigned",
      organizationId: maintainer.organizationId,
      teamId: maintainer.teamId,
    });
    return { status: "assigned", maintainer };
  }

  async revokeMaintainer(
    command: RevokeTeamMaintainerCommand,
  ): Promise<RevokeTeamMaintainerResult> {
    const team = await this.findActiveTeam(command.teamId);
    if (team === null) {
      return { status: "team-not-found" };
    }
    if (!(await this.isOrganizationOwner(command.actorAccountId, team))) {
      return { status: "permission-denied" };
    }
    const maintainer = await this.repository.findActiveMaintainer(
      team.teamId,
      command.targetAccountId,
    );
    if (maintainer === null) {
      return { status: "team-maintainer-not-found" };
    }
    const revoked = { ...maintainer, state: "revoked" as const };
    await this.repository.saveMaintainer(revoked);
    await this.recordEvent("TeamMaintainerChanged", revoked.teamMaintainerId, {
      accountId: revoked.accountId,
      action: "revoked",
      organizationId: revoked.organizationId,
      teamId: revoked.teamId,
    });
    return { status: "revoked", maintainer: revoked };
  }

  async listMembers(
    query: ListTeamMembersQuery,
  ): Promise<ListTeamMembersResult> {
    const team = await this.findActiveTeam(query.teamId);
    if (
      team === null ||
      !(await this.canViewTeam(query.actorAccountId, team))
    ) {
      return { status: "team-not-found" };
    }
    const memberships = await this.repository.listActiveMembershipsByTeam(
      team.teamId,
    );
    const members = await Promise.all(
      memberships.map(async (membership) => ({
        membership,
        isMaintainer:
          (await this.repository.findActiveMaintainer(
            team.teamId,
            membership.accountId,
          )) !== null,
      })),
    );
    return { status: "found", members };
  }

  async resolveMemberships(
    query: ResolveAccountTeamMembershipsQuery,
  ): Promise<ResolveAccountTeamMembershipsResult> {
    if (
      (await this.membershipGateway.getActiveMembership(
        query.accountId,
        query.organizationId,
      )) === null
    ) {
      return [];
    }
    const memberships =
      await this.repository.listActiveMembershipsByAccountAndOrganization(
        query.accountId,
        query.organizationId,
      );
    const result = [];
    for (const membership of memberships) {
      const team = await this.findActiveTeam(membership.teamId);
      if (team === null) {
        continue;
      }
      result.push({
        membership,
        ancestorTeamIds: await this.listAncestorTeamIds(team),
        isMaintainer:
          (await this.repository.findActiveMaintainer(
            team.teamId,
            query.accountId,
          )) !== null,
      });
    }
    return result;
  }

  private async findActiveTeam(teamId: string) {
    const team = await this.repository.findTeamById(teamId);
    return team?.lifecycleState === "active" ? team : null;
  }

  private async recordEvent(
    eventName: string,
    aggregateId: string,
    payload: Readonly<Record<string, unknown>>,
  ) {
    await this.eventRecorder?.record({
      aggregateId,
      aggregateVersion: 1,
      eventName,
      eventVersion: 1,
      orderingKey: aggregateId,
      payload,
    });
  }

  private async canViewTeam(
    accountId: string,
    team: OrganizationTeamReference,
  ) {
    const membership = await this.membershipGateway.getActiveMembership(
      accountId,
      team.organizationId,
    );
    if (membership === null) {
      return false;
    }
    return (
      team.visibility === "visible" ||
      membership.role === "owner" ||
      (await this.repository.findActiveMembership(team.teamId, accountId)) !==
        null
    );
  }

  private async canManageTeam(
    accountId: string,
    team: OrganizationTeamReference,
    knownMembership?: OrganizationMembershipSnapshot,
  ) {
    const membership =
      knownMembership ??
      (await this.membershipGateway.getActiveMembership(
        accountId,
        team.organizationId,
      ));
    return (
      membership?.role === "owner" ||
      (await this.repository.findActiveMaintainer(team.teamId, accountId)) !==
        null
    );
  }

  private async isOrganizationOwner(
    accountId: string,
    team: OrganizationTeamReference,
  ) {
    return (
      (
        await this.membershipGateway.getActiveMembership(
          accountId,
          team.organizationId,
        )
      )?.role === "owner"
    );
  }

  private async validateParentForCreate(
    organizationId: string,
    visibility: TeamVisibility,
    parentTeamId: string | null,
  ): Promise<
    "parent-team-invalid" | "secret-team-cannot-be-nested" | null
  > {
    if (parentTeamId === null) {
      return null;
    }
    if (visibility === "secret") {
      return "secret-team-cannot-be-nested";
    }
    const parent = await this.findActiveTeam(parentTeamId);
    if (parent === null || parent.organizationId !== organizationId) {
      return "parent-team-invalid";
    }
    return parent.visibility === "secret"
      ? "secret-team-cannot-be-nested"
      : null;
  }

  private async validateUpdatedHierarchy(
    team: OrganizationTeamReference,
    visibility: TeamVisibility,
    parentTeamId: string | null,
  ): Promise<
    | "parent-team-invalid"
    | "team-hierarchy-cycle"
    | "secret-team-cannot-be-nested"
    | null
  > {
    const children = await this.repository.listActiveChildren(team.teamId);
    if (
      visibility === "secret" &&
      (parentTeamId !== null || children.length > 0)
    ) {
      return "secret-team-cannot-be-nested";
    }
    if (parentTeamId === null) {
      return null;
    }
    const parent = await this.findActiveTeam(parentTeamId);
    if (parent === null || parent.organizationId !== team.organizationId) {
      return "parent-team-invalid";
    }
    if (parent.visibility === "secret") {
      return "secret-team-cannot-be-nested";
    }
    let cursor: OrganizationTeamReference | null = parent;
    const visited = new Set<string>();
    while (cursor !== null) {
      if (cursor.teamId === team.teamId) {
        return "team-hierarchy-cycle";
      }
      if (visited.has(cursor.teamId)) {
        return "team-hierarchy-cycle";
      }
      visited.add(cursor.teamId);
      cursor =
        cursor.parentTeamId === null
          ? null
          : await this.findActiveTeam(cursor.parentTeamId);
    }
    return null;
  }

  private async listAncestorTeamIds(team: OrganizationTeamReference) {
    const ancestorTeamIds: string[] = [];
    const visited = new Set<string>([team.teamId]);
    let parentTeamId = team.parentTeamId;
    while (parentTeamId !== null && !visited.has(parentTeamId)) {
      const parent = await this.findActiveTeam(parentTeamId);
      if (parent === null || parent.organizationId !== team.organizationId) {
        break;
      }
      ancestorTeamIds.push(parent.teamId);
      visited.add(parent.teamId);
      parentTeamId = parent.parentTeamId;
    }
    return ancestorTeamIds;
  }
}
