import { getPersonalAccountByUsername } from "@/modules/identity/accounts/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";
import { cache } from "react";

export const resolveOwnerIdByLogin = cache(async function resolveOwnerIdByLogin(
  ownerLogin: string,
): Promise<string | null> {
  const organization = await getOrganizationByLogin(ownerLogin);
  if (organization.status === "found") {
    return organization.organization.organizationId;
  }
  const account = await getPersonalAccountByUsername(ownerLogin);
  return account.isSuccessful ? account.account.accountId : null;
});

export const resolveRepositoryViewForActor = cache(
  async function resolveRepositoryViewForActor(
    actorAccountId: string | null,
    ownerLogin: string,
    repositoryName: string,
    repositoryQuery = getRepositoryForViewing,
  ) {
    const ownerId = await resolveOwnerIdByLogin(ownerLogin);
    if (ownerId === null) {
      return null;
    }
    const result = await repositoryQuery({
      actorAccountId,
      ownerId,
      name: repositoryName,
    });
    return result.status === "found" ? result.repository : null;
  },
);
