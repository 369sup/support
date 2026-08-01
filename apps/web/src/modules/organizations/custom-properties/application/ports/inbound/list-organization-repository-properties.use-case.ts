import type { OrganizationRepositoryPropertyDefinition } from "../../../domain/custom-property";

export interface ListOrganizationRepositoryPropertiesUseCase {
  listOrganizationRepositoryProperties(
    organizationId: string,
  ): Promise<readonly OrganizationRepositoryPropertyDefinition[]>;
}
