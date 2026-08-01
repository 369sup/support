import type { SetRepositoryPropertyValuesUseCase } from "../ports/inbound/set-repository-property-values.use-case";
import type {
  CustomPropertyValue,
  OrganizationRepositoryPropertyDefinition,
} from "../../domain/custom-property";
import type { CustomPropertyService } from "../services/custom-property.service";

export class SetRepositoryPropertyValuesHandler
  implements SetRepositoryPropertyValuesUseCase
{
  private readonly service: CustomPropertyService;

  constructor(service: CustomPropertyService) {
    this.service = service;
  }

  setRepositoryPropertyValues(
    repositoryIds: readonly string[],
    definitions: readonly OrganizationRepositoryPropertyDefinition[],
    requested: Readonly<Record<string, CustomPropertyValue>>,
    actorAccountId: string,
  ) {
    return this.service.setValues(
      repositoryIds,
      definitions,
      requested,
      actorAccountId,
    );
  }
}
