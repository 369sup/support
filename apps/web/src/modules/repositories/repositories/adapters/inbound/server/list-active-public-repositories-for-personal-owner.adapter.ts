import type { UserOwnerReference } from "@/modules/identity/accounts/integration-contracts";

import type { PublicRepositorySummary } from "../../../contracts/repository-summary";
import { publicRepositoryQueryRuntime } from "./public-repository-query-runtime.adapter";

export async function listActivePublicRepositoriesForPersonalOwner(
  owner: UserOwnerReference,
): Promise<readonly PublicRepositorySummary[]> {
  const repositories = await publicRepositoryQueryRuntime
    .getListActivePublicRepositoriesForPersonalOwnerUseCase()
    .listActivePublicRepositoriesForPersonalOwner({
      ownerAccountId: owner.accountId,
    });

  return repositories.map((repository) => ({
    repositoryId: repository.repositoryId,
    ownerUsername: owner.username,
    name: repository.name,
    description: repository.description,
    visibility: "public",
    lifecycleState: "active",
    updatedAt: repository.updatedAt,
  }));
}
