import { NodeOrganizationIdGeneratorAdapter } from "../adapters/outbound/persistence/node-organization-id-generator.adapter";
import { PostgresOrganizationQueryAdapter } from "../adapters/outbound/persistence/postgres-organization-query.adapter";
import { CreateOrganizationHandler } from "../application/commands/create-organization.handler";
import type { CreateOrganizationUseCase } from "../application/ports/inbound/create-organization.use-case";
import { GetOrganizationByLoginHandler } from "../application/queries/get-organization-by-login.handler";
import { GetOrganizationReferenceByIdHandler } from "../application/queries/get-organization-reference-by-id.handler";
import type { OrganizationLookupResult } from "../contracts/organization-reference";
import { getProductionDatabase } from "../../../../../production-runtime";

export interface OrganizationsServerFacade {
  createOrganization: CreateOrganizationUseCase["createOrganization"];
  getOrganizationByLogin: (login: string) => Promise<OrganizationLookupResult>;
  getOrganizationReferenceById: (
    organizationId: string,
  ) => Promise<OrganizationLookupResult>;
}

function composeOrganizationsServerFacade(): OrganizationsServerFacade {
  const database = getProductionDatabase();
  const repository = new PostgresOrganizationQueryAdapter(database);
  const getByLogin = new GetOrganizationByLoginHandler(repository);
  const getById = new GetOrganizationReferenceByIdHandler(repository);
  const create = new CreateOrganizationHandler(
    repository,
    new NodeOrganizationIdGeneratorAdapter(),
  );

  return {
    createOrganization: (command) => create.createOrganization(command),
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
