import type {
  ChangeTeamRepositoryAccessCommand,
  ChangeTeamRepositoryAccessResult,
} from "../ports/inbound/change-team-repository-access.use-case";
import type {
  GrantTeamRepositoryAccessCommand,
  GrantTeamRepositoryAccessResult,
} from "../ports/inbound/grant-team-repository-access.use-case";
import type {
  ResolveEffectiveRepositoryPermissionUseCase,
} from "../ports/inbound/resolve-effective-repository-permission.use-case";
import type {
  RevokeTeamRepositoryAccessCommand,
  RevokeTeamRepositoryAccessResult,
} from "../ports/inbound/revoke-team-repository-access.use-case";
import type { OrganizationTeamGatewayPort } from "../ports/outbound/organization-team.gateway.port";
import type { TeamRepositoryGrantIdGeneratorPort } from "../ports/outbound/team-repository-grant-id-generator.port";
import type { TeamRepositoryGrantRepositoryPort } from "../ports/outbound/team-repository-grant.repository.port";
import type { EventRecorderPort } from "@/modules/platform/event-publication/integration-contracts";

export class TeamRepositoryAccessService {
  private readonly grantRepository: TeamRepositoryGrantRepositoryPort;
  private readonly teamGateway: OrganizationTeamGatewayPort;
  private readonly permissionResolver: ResolveEffectiveRepositoryPermissionUseCase;
  private readonly idGenerator: TeamRepositoryGrantIdGeneratorPort;
  private readonly eventRecorder: EventRecorderPort | undefined;

  constructor(
    grantRepository: TeamRepositoryGrantRepositoryPort,
    teamGateway: OrganizationTeamGatewayPort,
    permissionResolver: ResolveEffectiveRepositoryPermissionUseCase,
    idGenerator: TeamRepositoryGrantIdGeneratorPort,
    eventRecorder?: EventRecorderPort,
  ) {
    this.grantRepository = grantRepository;
    this.teamGateway = teamGateway;
    this.permissionResolver = permissionResolver;
    this.idGenerator = idGenerator;
    this.eventRecorder = eventRecorder;
  }

  async grant(
    command: GrantTeamRepositoryAccessCommand,
  ): Promise<GrantTeamRepositoryAccessResult> {
    const organizationId = this.getOrganizationId(command.repository.owner);
    if (organizationId === null) {
      return { status: "repository-not-organization-owned" };
    }
    const team = await this.teamGateway.getTeamForActor({
      actorAccountId: command.actorAccountId,
      organizationId,
      teamId: command.teamId,
    });
    if (team === null || team.organizationId !== organizationId) {
      return { status: "team-not-eligible" };
    }
    if (!(await this.hasRepositoryAdmin(command))) {
      return { status: "permission-denied" };
    }
    if (
      (await this.grantRepository.findActiveByRepositoryAndTeam(
        command.repository.repositoryId,
        command.teamId,
      )) !== null
    ) {
      return { status: "team-grant-conflict" };
    }
    const grant = {
      grantId: this.idGenerator.nextTeamGrantId(),
      repositoryId: command.repository.repositoryId,
      organizationId,
      teamId: command.teamId,
      permission: command.permission,
      state: "active" as const,
    };
    await this.grantRepository.saveTeamGrant(grant);
    await this.recordGrantEvent("TeamRepositoryAccessGranted", grant);
    return { status: "granted", grant };
  }

  async change(
    command: ChangeTeamRepositoryAccessCommand,
  ): Promise<ChangeTeamRepositoryAccessResult> {
    const organizationId = this.getOrganizationId(command.repository.owner);
    if (organizationId === null) {
      return { status: "repository-not-organization-owned" };
    }
    const team = await this.teamGateway.getTeamForActor({
      actorAccountId: command.actorAccountId,
      organizationId,
      teamId: command.teamId,
    });
    if (team === null || team.organizationId !== organizationId) {
      return { status: "team-not-eligible" };
    }
    if (!(await this.hasRepositoryAdmin(command))) {
      return { status: "permission-denied" };
    }
    const grant = await this.grantRepository.findActiveByRepositoryAndTeam(
      command.repository.repositoryId,
      command.teamId,
    );
    if (grant === null) {
      return { status: "team-grant-not-found" };
    }
    const changed = { ...grant, permission: command.permission };
    await this.grantRepository.saveTeamGrant(changed);
    await this.recordGrantEvent("TeamRepositoryAccessGranted", changed);
    return { status: "changed", grant: changed };
  }

  async revoke(
    command: RevokeTeamRepositoryAccessCommand,
  ): Promise<RevokeTeamRepositoryAccessResult> {
    const organizationId = this.getOrganizationId(command.repository.owner);
    if (organizationId === null) {
      return { status: "repository-not-organization-owned" };
    }
    const team = await this.teamGateway.getTeamForActor({
      actorAccountId: command.actorAccountId,
      organizationId,
      teamId: command.teamId,
    });
    if (team === null || team.organizationId !== organizationId) {
      return { status: "team-not-eligible" };
    }
    if (!(await this.hasRepositoryAdmin(command)) && !team.isMaintainer) {
      return { status: "permission-denied" };
    }
    const grant = await this.grantRepository.findActiveByRepositoryAndTeam(
      command.repository.repositoryId,
      command.teamId,
    );
    if (grant !== null) {
      const revoked = { ...grant, state: "revoked" as const };
      await this.grantRepository.saveTeamGrant(revoked);
      await this.recordGrantEvent("TeamRepositoryAccessRevoked", revoked);
      return { status: "revoked", grant: revoked };
    }
    const ancestorTeamIds = await this.teamGateway.listAncestorTeamIds({
      actorAccountId: command.actorAccountId,
      organizationId,
      teamId: command.teamId,
    });
    const inherited = (
      await this.grantRepository.findActiveByRepository(
        command.repository.repositoryId,
      )
    ).some((candidate) => ancestorTeamIds.includes(candidate.teamId));
    return inherited
      ? { status: "inherited-access-cannot-be-removed" }
      : { status: "team-grant-not-found" };
  }

  private getOrganizationId(
    owner:
      | Readonly<{ kind: "personal"; accountId: string }>
      | Readonly<{ kind: "organization"; organizationId: string }>,
  ) {
    return owner.kind === "organization" ? owner.organizationId : null;
  }

  private async recordGrantEvent(
    eventName: "TeamRepositoryAccessGranted" | "TeamRepositoryAccessRevoked",
    grant: Readonly<{
      grantId: string;
      organizationId: string;
      permission: string;
      repositoryId: string;
      state: string;
      teamId: string;
    }>,
  ) {
    await this.eventRecorder?.record({
      aggregateId: grant.grantId,
      aggregateVersion: 1,
      eventName,
      eventVersion: 1,
      orderingKey: grant.grantId,
      payload: grant,
    });
  }

  private async hasRepositoryAdmin(
    command:
      | GrantTeamRepositoryAccessCommand
      | ChangeTeamRepositoryAccessCommand
      | RevokeTeamRepositoryAccessCommand,
  ) {
    const decision =
      await this.permissionResolver.resolveEffectiveRepositoryPermission({
        repository: command.repository,
        accountId: command.actorAccountId,
      });
    return decision.permission === "admin";
  }
}
