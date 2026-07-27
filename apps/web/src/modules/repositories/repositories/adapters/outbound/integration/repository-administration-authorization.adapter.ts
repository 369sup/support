import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";
import { resolveEffectiveRepositoryPermission } from "@/modules/repositories/repository-access/server-api";

import type {
  RepositoryAdministrationAuthorizationGatewayPort,
  RepositoryAdministrationAuthorizationInput,
} from "../../../application/ports/outbound/repository-administration-authorization.gateway.port";

export class RepositoryAdministrationAuthorizationAdapter
  implements RepositoryAdministrationAuthorizationGatewayPort
{
  async hasRepositoryAdministration(
    input: RepositoryAdministrationAuthorizationInput,
  ): Promise<boolean> {
    const actor = await getAccountReferenceById(input.actorAccountId);
    if (
      actor.status !== "found" ||
      actor.account.lifecycleState !== "active"
    ) {
      return false;
    }

    const decision = await resolveEffectiveRepositoryPermission({
      actor: actor.account,
      repository: {
        repositoryId: input.repository.repositoryId,
        owner:
          input.repository.owner.kind === "personal"
            ? {
                kind: "personal",
                accountId: input.repository.owner.id,
              }
            : {
                kind: "organization",
                organizationId: input.repository.owner.id,
              },
        visibility: input.repository.visibility,
        lifecycleState: input.repository.lifecycleState,
      },
    });
    return decision.permission === "admin";
  }
}
