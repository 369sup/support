import { predefinedOrganizationRoleCatalog } from "../../domain/predefined-organization-role-catalog";
import type {
  OrganizationRepositoryRoleContribution,
  OrganizationRoleAssignmentSubject,
  PredefinedOrganizationRoleKey,
} from "../../contracts/organization-role-reference";
import type {
  AssignOrganizationRoleCommand,
  AssignOrganizationRoleResult,
} from "../ports/inbound/assign-organization-role.use-case";
import type {
  ListOrganizationRoleAssignmentsQuery,
  ListOrganizationRoleAssignmentsResult,
} from "../ports/inbound/list-organization-role-assignments.use-case";
import type {
  ListPredefinedOrganizationRolesQuery,
  ListPredefinedOrganizationRolesResult,
} from "../ports/inbound/list-predefined-organization-roles.use-case";
import type {
  ResolveOrganizationRepositoryRoleContributionsQuery,
  ResolveOrganizationRepositoryRoleContributionsResult,
} from "../ports/inbound/resolve-organization-repository-role-contributions.use-case";
import type {
  RevokeOrganizationRoleCommand,
  RevokeOrganizationRoleResult,
} from "../ports/inbound/revoke-organization-role.use-case";
import type { OrganizationMembershipGatewayPort } from "../ports/outbound/organization-membership.gateway.port";
import type { OrganizationRoleAssignmentRepositoryPort } from "../ports/outbound/organization-role-assignment.repository.port";
import type { OrganizationRoleIdGeneratorPort } from "../ports/outbound/organization-role-id-generator.port";
import type { OrganizationTeamGatewayPort } from "../ports/outbound/organization-team.gateway.port";

function subjectKey(subject: OrganizationRoleAssignmentSubject) {
  return subject.kind === "account"
    ? `account:${subject.accountId}`
    : `team:${subject.teamId}`;
}

export class OrganizationRoleService {
  constructor(
    private readonly assignmentRepository: OrganizationRoleAssignmentRepositoryPort,
    private readonly membershipGateway: OrganizationMembershipGatewayPort,
    private readonly teamGateway: OrganizationTeamGatewayPort,
    private readonly idGenerator: OrganizationRoleIdGeneratorPort,
  ) {}

  async listDefinitions(
    query: ListPredefinedOrganizationRolesQuery,
  ): Promise<ListPredefinedOrganizationRolesResult> {
    const membership = await this.membershipGateway.getActiveMembership(
      query.actorAccountId,
      query.organizationId,
    );
    return membership === null
      ? { status: "membership-inactive" }
      : { status: "found", roles: predefinedOrganizationRoleCatalog };
  }

  async listAssignments(
    query: ListOrganizationRoleAssignmentsQuery,
  ): Promise<ListOrganizationRoleAssignmentsResult> {
    if (!(await this.isOwner(query.actorAccountId, query.organizationId))) {
      return { status: "permission-denied" };
    }
    const assignments = await this.assignmentRepository.listByOrganization(
      query.organizationId,
    );
    return {
      status: "found",
      assignments: assignments.filter(
        (assignment) => assignment.state === "active",
      ),
    };
  }

  async assign(
    command: AssignOrganizationRoleCommand,
  ): Promise<AssignOrganizationRoleResult> {
    if (
      !(await this.isOwner(command.actorAccountId, command.organizationId))
    ) {
      return { status: "permission-denied" };
    }
    const definition = this.findDefinition(command.roleKey);
    if (definition === undefined) {
      return { status: "role-not-found" };
    }
    if (!(await this.isEligibleSubject(command))) {
      return { status: "subject-not-eligible" };
    }
    if (
      (await this.assignmentRepository.findActiveByOrganizationSubjectAndRole(
        command.organizationId,
        subjectKey(command.subject),
        command.roleKey,
      )) !== null
    ) {
      return { status: "assignment-conflict" };
    }
    const assignment = {
      assignmentId: this.idGenerator.nextAssignmentId(),
      organizationId: command.organizationId,
      roleKey: definition.roleKey,
      subject: command.subject,
      state: "active" as const,
    };
    await this.assignmentRepository.save(assignment);
    return { status: "assigned", assignment };
  }

  async revoke(
    command: RevokeOrganizationRoleCommand,
  ): Promise<RevokeOrganizationRoleResult> {
    if (
      !(await this.isOwner(command.actorAccountId, command.organizationId))
    ) {
      return { status: "permission-denied" };
    }
    const assignment = await this.assignmentRepository.findById(
      command.assignmentId,
    );
    if (
      assignment === null ||
      assignment.organizationId !== command.organizationId ||
      assignment.state !== "active"
    ) {
      return { status: "assignment-not-found" };
    }
    const revoked = { ...assignment, state: "revoked" as const };
    await this.assignmentRepository.save(revoked);
    return { status: "revoked", assignment: revoked };
  }

  async resolveContributions(
    query: ResolveOrganizationRepositoryRoleContributionsQuery,
  ): Promise<ResolveOrganizationRepositoryRoleContributionsResult> {
    if (
      (await this.membershipGateway.getActiveMembership(
        query.accountId,
        query.organizationId,
      )) === null
    ) {
      return [];
    }
    const [assignments, directTeamIds] = await Promise.all([
      this.assignmentRepository.listByOrganization(query.organizationId),
      this.teamGateway.listDirectTeamIdsForAccount(
        query.accountId,
        query.organizationId,
      ),
    ]);
    const directTeams = new Set(directTeamIds);
    const contributions: OrganizationRepositoryRoleContribution[] = [];
    for (const assignment of assignments) {
      if (
        assignment.state !== "active" ||
        !this.subjectMatchesAccount(
          assignment.subject,
          query.accountId,
          directTeams,
        )
      ) {
        continue;
      }
      const permission = this.findDefinition(
        assignment.roleKey,
      )?.repositoryPermission;
      if (permission !== null && permission !== undefined) {
        contributions.push({
          assignmentId: assignment.assignmentId,
          roleKey: assignment.roleKey,
          subject: assignment.subject,
          permission,
        });
      }
    }
    return contributions;
  }

  private findDefinition(roleKey: PredefinedOrganizationRoleKey) {
    return predefinedOrganizationRoleCatalog.find(
      (definition) => definition.roleKey === roleKey,
    );
  }

  private async isOwner(accountId: string, organizationId: string) {
    return (
      (
        await this.membershipGateway.getActiveMembership(
          accountId,
          organizationId,
        )
      )?.role === "owner"
    );
  }

  private async isEligibleSubject(
    command: AssignOrganizationRoleCommand,
  ) {
    if (command.subject.kind === "account") {
      return (
        (await this.membershipGateway.getActiveMembership(
          command.subject.accountId,
          command.organizationId,
        )) !== null
      );
    }
    return this.teamGateway.isActiveTeam({
      actorAccountId: command.actorAccountId,
      organizationId: command.organizationId,
      teamId: command.subject.teamId,
    });
  }

  private subjectMatchesAccount(
    subject: OrganizationRoleAssignmentSubject,
    accountId: string,
    directTeamIds: ReadonlySet<string>,
  ) {
    return subject.kind === "account"
      ? subject.accountId === accountId
      : directTeamIds.has(subject.teamId);
  }
}
