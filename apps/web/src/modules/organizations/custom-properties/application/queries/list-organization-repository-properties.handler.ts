import type { ListOrganizationRepositoryPropertiesUseCase } from "../ports/inbound/list-organization-repository-properties.use-case";
import type { CustomPropertyService } from "../services/custom-property.service";

export class ListOrganizationRepositoryPropertiesHandler
  implements ListOrganizationRepositoryPropertiesUseCase
{
  private readonly service: CustomPropertyService;

  constructor(service: CustomPropertyService) {
    this.service = service;
  }

  listOrganizationRepositoryProperties(organizationId: string) {
    return this.service.list(organizationId);
  }
}
