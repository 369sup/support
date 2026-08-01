import type {
  DefineOrganizationRepositoryPropertyInput,
  OrganizationRepositoryPropertyDefinition,
  RepositoryPropertyValue,
} from "../../../domain/custom-property";

export interface CustomPropertyRepositoryPort {
  define(
    definition: OrganizationRepositoryPropertyDefinition,
  ): Promise<"defined" | "name-conflict">;
  listDefinitions(
    organizationId: string,
  ): Promise<readonly OrganizationRepositoryPropertyDefinition[]>;
  setRepositoryValues(
    repositoryIds: readonly string[],
    values: readonly RepositoryPropertyValue[],
    actorAccountId: string,
  ): Promise<void>;
  searchRepositoryIds(
    organizationId: string,
    propertyName: string,
    value: string,
  ): Promise<readonly string[]>;
}

export interface CustomPropertyIdGeneratorPort {
  nextPropertyId(): string;
}

export type DefinePropertyCommand =
  DefineOrganizationRepositoryPropertyInput;
