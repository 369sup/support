import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";
import { resolveEffectiveRepositoryPermission } from "@/modules/repositories/repository-access/server-api";

import type { RepositoryViewAuthorizationGatewayPort } from "../../../application/ports/outbound/repository-view-authorization.gateway.port";
import type { RepositoryQuerySnapshot } from "../../../application/ports/outbound/repository-query.repository.port";

export class RepositoryViewAuthorizationAdapter
  implements RepositoryViewAuthorizationGatewayPort
{
  async resolveRepositoryPermission(input: {
    actorAccountId: string;
    repository: RepositoryQuerySnapshot;
  }) {
    const actor = await getAccountReferenceById(input.actorAccountId);
    if (
      actor.status !== "found" ||
      actor.account.lifecycleState !== "active" ||
      input.repository.lifecycleState === "deleted"
    ) {
      return null;
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
    return decision.isAllowed ? decision.permission : null;
  }
}
