import type { AccountReference } from "@/modules/identity/accounts/integration-contracts";
import type { RepositoryCandidateReference } from "@/modules/repositories/repositories/integration-contracts";

import { OrganizationMembershipAdapter } from "../adapters/outbound/integration/organization-membership.adapter";
import { InMemoryRepositoryGrantAdapter } from "../adapters/outbound/persistence/in-memory-repository-grant.adapter";
import { ResolveEffectiveRepositoryPermissionHandler } from "../application/queries/resolve-effective-repository-permission.handler";
import type { EffectiveRepositoryPermissionDecision } from "../contracts/effective-repository-permission-decision";

export interface RepositoryAccessServerFacade {
  resolveEffectiveRepositoryPermission: (input: {
    repository: RepositoryCandidateReference;
    actor: AccountReference;
  }) => Promise<EffectiveRepositoryPermissionDecision>;
}

function composeRepositoryAccessServerFacade(): RepositoryAccessServerFacade {
  const handler = new ResolveEffectiveRepositoryPermissionHandler(
    new InMemoryRepositoryGrantAdapter(),
    new OrganizationMembershipAdapter(),
  );
  return {
    resolveEffectiveRepositoryPermission: ({ repository, actor }) =>
      handler.resolveEffectiveRepositoryPermission({
        repository: {
          repositoryId: repository.repositoryId,
          owner:
            repository.owner.kind === "personal"
              ? {
                  kind: "personal",
                  accountId: repository.owner.accountId,
                }
              : {
                  kind: "organization",
                  organizationId: repository.owner.organizationId,
                },
          visibility: repository.visibility,
        },
        accountId: actor.accountId,
      }),
  };
}

export const repositoryAccessServerFacade =
  composeRepositoryAccessServerFacade();
