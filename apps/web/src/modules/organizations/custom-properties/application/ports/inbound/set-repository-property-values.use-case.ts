import type {
  CustomPropertyValue,
  OrganizationRepositoryPropertyDefinition,
} from "../../../domain/custom-property";

export interface SetRepositoryPropertyValuesUseCase {
  setRepositoryPropertyValues(
    repositoryIds: readonly string[],
    definitions: readonly OrganizationRepositoryPropertyDefinition[],
    requested: Readonly<Record<string, CustomPropertyValue>>,
    actorAccountId: string,
  ): Promise<SetRepositoryPropertyValuesResult>;
}

export type SetRepositoryPropertyValuesResult = Readonly<{
  status: "updated" | "invalid-value" | "required-value-missing";
}>;
