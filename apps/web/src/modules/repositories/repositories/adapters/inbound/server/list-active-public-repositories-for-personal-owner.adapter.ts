import type { UserOwnerReference } from "@/modules/identity/accounts/integration-contracts";

import type { ListActivePublicRepositoriesForPersonalOwnerUseCase } from "../../../application/ports/inbound/list-active-public-repositories-for-personal-owner.use-case";
import type { PublicRepositorySummary } from "../../../contracts/repository-summary";

export type ListActivePublicRepositoriesForPersonalOwnerAdapter = (
  owner: UserOwnerReference,
) => Promise<readonly PublicRepositorySummary[]>;

export function createListActivePublicRepositoriesForPersonalOwnerAdapter(
  useCase: ListActivePublicRepositoriesForPersonalOwnerUseCase,
): ListActivePublicRepositoriesForPersonalOwnerAdapter {
  return async function listActivePublicRepositoriesForPersonalOwner(
    owner: UserOwnerReference,
  ): Promise<readonly PublicRepositorySummary[]> {
    const repositories =
      await useCase.listActivePublicRepositoriesForPersonalOwner({
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
  };
}
