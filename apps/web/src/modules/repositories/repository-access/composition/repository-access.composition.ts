import type { AccountReference } from "@/modules/identity/accounts/integration-contracts";
import {
  createContextEventSource,
  registerEventSource,
} from "@/modules/platform/event-publication/server-api";

import { OrganizationMembershipAdapter } from "../adapters/outbound/integration/organization-membership.adapter";
import { OrganizationPolicyAdapter } from "../adapters/outbound/integration/organization-policy.adapter";
import { OrganizationRoleAdapter } from "../adapters/outbound/integration/organization-role.adapter";
import { OrganizationTeamAdapter } from "../adapters/outbound/integration/organization-team.adapter";
import { InMemoryRepositoryGrantAdapter } from "../adapters/outbound/persistence/in-memory-repository-grant.adapter";
import { InMemoryTeamRepositoryGrantIdGeneratorAdapter } from "../adapters/outbound/persistence/in-memory-team-repository-grant-id-generator.adapter";
import { NodeTeamRepositoryGrantIdGeneratorAdapter } from "../adapters/outbound/persistence/node-team-repository-grant-id-generator.adapter";
import { PostgresRepositoryGrantAdapter } from "../adapters/outbound/persistence/postgres-repository-grant.adapter";
import { ChangeTeamRepositoryAccessHandler } from "../application/commands/change-team-repository-access.handler";
import { GrantTeamRepositoryAccessHandler } from "../application/commands/grant-team-repository-access.handler";
import { RevokeTeamRepositoryAccessHandler } from "../application/commands/revoke-team-repository-access.handler";
import { getProductionDatabase } from "../../../../../production-runtime";
import { ResolveEffectiveRepositoryPermissionHandler } from "../application/queries/resolve-effective-repository-permission.handler";
import { TeamRepositoryAccessService } from "../application/services/team-repository-access.service";
import type {
  EffectiveRepositoryPermissionDecision,
  RepositoryPermission,
  TeamRepositoryGrantReference,
} from "../contracts/effective-repository-permission-decision";
import type {
  ActiveRepositoryAccessTarget,
  RepositoryAccessTarget,
} from "../contracts/repository-access-target";

type TeamGrantInput = Readonly<{
  repository: ActiveRepositoryAccessTarget;
  actor: AccountReference;
  teamId: string;
}>;

export interface RepositoryAccessServerFacade {
  resolveEffectiveRepositoryPermission: (input: {
    repository: RepositoryAccessTarget;
    actor: AccountReference;
  }) => Promise<EffectiveRepositoryPermissionDecision>;
  grantTeamRepositoryAccess: (
    input: TeamGrantInput & { permission: RepositoryPermission },
  ) => Promise<
    | { status: "granted"; grant: TeamRepositoryGrantReference }
    | {
        status:
          | "permission-denied"
          | "repository-not-organization-owned"
          | "team-not-eligible"
          | "team-grant-conflict";
      }
  >;
  changeTeamRepositoryAccess: (
    input: TeamGrantInput & { permission: RepositoryPermission },
  ) => Promise<
    | { status: "changed"; grant: TeamRepositoryGrantReference }
    | {
        status:
          | "permission-denied"
          | "repository-not-organization-owned"
          | "team-not-eligible"
          | "team-grant-not-found";
      }
  >;
  revokeTeamRepositoryAccess: (
    input: TeamGrantInput,
  ) => Promise<
    | { status: "revoked"; grant: TeamRepositoryGrantReference }
    | {
        status:
          | "permission-denied"
          | "repository-not-organization-owned"
          | "team-not-eligible"
          | "team-grant-not-found"
          | "inherited-access-cannot-be-removed";
      }
  >;
}

function mapRepository(repository: RepositoryAccessTarget) {
  return {
    repositoryId: repository.repositoryId,
    owner:
      repository.owner.kind === "personal"
        ? {
            kind: "personal" as const,
            accountId: repository.owner.accountId,
          }
        : {
            kind: "organization" as const,
            organizationId: repository.owner.organizationId,
          },
    visibility: repository.visibility,
  };
}

function composeRepositoryAccessServerFacade(): RepositoryAccessServerFacade {
  const database = getProductionDatabase();
  const grantAdapter =
    database === null
      ? new InMemoryRepositoryGrantAdapter()
      : new PostgresRepositoryGrantAdapter(database);
  const eventRecorder = createContextEventSource(
    "repositories/repository-access",
  );
  registerEventSource(eventRecorder);
  const teamAdapter = new OrganizationTeamAdapter();
  const resolver = new ResolveEffectiveRepositoryPermissionHandler(
    grantAdapter,
    new OrganizationMembershipAdapter(),
    new OrganizationPolicyAdapter(),
    grantAdapter,
    teamAdapter,
    new OrganizationRoleAdapter(),
  );
  const teamAccessService = new TeamRepositoryAccessService(
    grantAdapter,
    teamAdapter,
    resolver,
    database === null
      ? new InMemoryTeamRepositoryGrantIdGeneratorAdapter()
      : new NodeTeamRepositoryGrantIdGeneratorAdapter(),
    eventRecorder,
  );
  const grant = new GrantTeamRepositoryAccessHandler(teamAccessService);
  const change = new ChangeTeamRepositoryAccessHandler(teamAccessService);
  const revoke = new RevokeTeamRepositoryAccessHandler(teamAccessService);

  return {
    resolveEffectiveRepositoryPermission: ({ repository, actor }) =>
      resolver.resolveEffectiveRepositoryPermission({
        repository: mapRepository(repository),
        accountId: actor.accountId,
      }),
    grantTeamRepositoryAccess: ({ repository, actor, teamId, permission }) =>
      grant.grantTeamRepositoryAccess({
        repository: mapRepository(repository),
        actorAccountId: actor.accountId,
        teamId,
        permission,
      }),
    changeTeamRepositoryAccess: ({
      repository,
      actor,
      teamId,
      permission,
    }) =>
      change.changeTeamRepositoryAccess({
        repository: mapRepository(repository),
        actorAccountId: actor.accountId,
        teamId,
        permission,
      }),
    revokeTeamRepositoryAccess: ({ repository, actor, teamId }) =>
      revoke.revokeTeamRepositoryAccess({
        repository: mapRepository(repository),
        actorAccountId: actor.accountId,
        teamId,
      }),
  };
}

export const repositoryAccessServerFacade =
  composeRepositoryAccessServerFacade();
