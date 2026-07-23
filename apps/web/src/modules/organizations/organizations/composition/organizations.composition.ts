import { InMemoryOrganizationQueryAdapter } from "../adapters/outbound/persistence/in-memory-organization-query.adapter";
import { GetOrganizationByLoginHandler } from "../application/queries/get-organization-by-login.handler";
import { GetOrganizationReferenceByIdHandler } from "../application/queries/get-organization-reference-by-id.handler";
import type { OrganizationLookupResult } from "../contracts/organization-reference";

export interface OrganizationsServerFacade {
  getOrganizationByLogin: (login: string) => Promise<OrganizationLookupResult>;
  getOrganizationReferenceById: (
    organizationId: string,
  ) => Promise<OrganizationLookupResult>;
}

function composeOrganizationsServerFacade(): OrganizationsServerFacade {
  const repository = new InMemoryOrganizationQueryAdapter();
  const getByLogin = new GetOrganizationByLoginHandler(repository);
  const getById = new GetOrganizationReferenceByIdHandler(repository);

  return {
    getOrganizationByLogin: async (login) => {
      const result = await getByLogin.getOrganizationByLogin({ login });
      return result.status === "found"
        ? { status: "found", organization: result.organization }
        : result;
    },
    getOrganizationReferenceById: async (organizationId) => {
      const result = await getById.getOrganizationReferenceById({
        organizationId,
      });
      return result.status === "found"
        ? { status: "found", organization: result.organization }
        : result;
    },
  };
}

export const organizationsServerFacade =
  composeOrganizationsServerFacade();
