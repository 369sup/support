import type { DefineOrganizationRepositoryPropertyUseCase } from "../ports/inbound/define-organization-repository-property.use-case";
import type { DefineOrganizationRepositoryPropertyResult } from "../ports/inbound/define-organization-repository-property.use-case";
import type { DefineOrganizationRepositoryPropertyInput } from "../../domain/custom-property";
import type { CustomPropertyService } from "../services/custom-property.service";

export class DefineOrganizationRepositoryPropertyHandler
  implements DefineOrganizationRepositoryPropertyUseCase
{
  private readonly service: CustomPropertyService;

  constructor(service: CustomPropertyService) {
    this.service = service;
  }

  defineOrganizationRepositoryProperty(
    command: DefineOrganizationRepositoryPropertyInput,
  ): Promise<DefineOrganizationRepositoryPropertyResult> {
    return this.service.define(command);
  }
}
