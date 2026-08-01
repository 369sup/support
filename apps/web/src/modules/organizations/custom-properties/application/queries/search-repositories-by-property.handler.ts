import type { SearchRepositoriesByPropertyUseCase } from "../ports/inbound/search-repositories-by-property.use-case";
import type { CustomPropertyService } from "../services/custom-property.service";

export class SearchRepositoriesByPropertyHandler
  implements SearchRepositoriesByPropertyUseCase
{
  private readonly service: CustomPropertyService;

  constructor(service: CustomPropertyService) {
    this.service = service;
  }

  searchRepositoriesByProperty(
    organizationId: string,
    propertyName: string,
    value: string,
  ) {
    return this.service.search(organizationId, propertyName, value);
  }
}
