import type {
  CustomPropertyIdGeneratorPort,
  CustomPropertyRepositoryPort,
  DefinePropertyCommand,
} from "../ports/outbound/custom-property.repository.port";
import type {
  CustomPropertyValue,
  OrganizationRepositoryPropertyDefinition,
  RepositoryPropertyValue,
} from "../../domain/custom-property";
import type { DefineOrganizationRepositoryPropertyResult } from "../ports/inbound/define-organization-repository-property.use-case";
import type { SetRepositoryPropertyValuesResult } from "../ports/inbound/set-repository-property-values.use-case";

const propertyNamePattern = /^[A-Za-z0-9_$#-]{1,75}$/;
const printableAsciiWithoutQuote = /^[\x20-\x21\x23-\x7E]*$/;

function isValidScalar(value: string): boolean {
  return value.length <= 75 && printableAsciiWithoutQuote.test(value);
}

function isValidValue(
  definition: Pick<
    OrganizationRepositoryPropertyDefinition,
    "valueType" | "allowedValues"
  >,
  value: CustomPropertyValue,
): boolean {
  if (value === null) {return true;}
  switch (definition.valueType) {
    case "text":
      return typeof value === "string" && isValidScalar(value);
    case "true-false":
      return typeof value === "boolean";
    case "single-select":
      return (
        typeof value === "string" &&
        definition.allowedValues.includes(value)
      );
    case "multi-select":
      return (
        Array.isArray(value) &&
        value.every(
          (entry) =>
            typeof entry === "string" &&
            definition.allowedValues.includes(entry),
        )
      );
  }
}

export class CustomPropertyService {
  private readonly repository: CustomPropertyRepositoryPort;
  private readonly ids: CustomPropertyIdGeneratorPort;

  constructor(
    repository: CustomPropertyRepositoryPort,
    ids: CustomPropertyIdGeneratorPort,
  ) {
    this.repository = repository;
    this.ids = ids;
  }

  async define(
    command: DefinePropertyCommand,
  ): Promise<DefineOrganizationRepositoryPropertyResult> {
    if (!propertyNamePattern.test(command.name)) {
      return { status: "invalid-name" };
    }
    if (command.description.length > 255) {
      return { status: "invalid-description" };
    }
    if (
      !command.allowedValues.every(isValidScalar) ||
      new Set(command.allowedValues).size !== command.allowedValues.length
    ) {
      return { status: "invalid-allowed-values" };
    }
    if (!isValidValue(command, command.defaultValue)) {
      return { status: "invalid-default-value" };
    }
    const propertyId = this.ids.nextPropertyId();
    const result = await this.repository.define({ ...command, propertyId });
    return result === "defined"
      ? { status: "defined", propertyId }
      : { status: "name-conflict" };
  }

  list(organizationId: string) {
    return this.repository.listDefinitions(organizationId);
  }

  async setValues(
    repositoryIds: readonly string[],
    definitions: readonly OrganizationRepositoryPropertyDefinition[],
    requested: Readonly<Record<string, CustomPropertyValue>>,
    actorAccountId: string,
  ): Promise<SetRepositoryPropertyValuesResult> {
    const values: RepositoryPropertyValue[] = [];
    for (const definition of definitions) {
      const hasExplicit = Object.hasOwn(requested, definition.propertyId);
      const value = hasExplicit
        ? (requested[definition.propertyId] ?? null)
        : definition.defaultValue;
      if (
        definition.isRequired &&
        (value === null ||
          (definition.isExplicitValueRequired && !hasExplicit))
      ) {
        return { status: "required-value-missing" };
      }
      if (!isValidValue(definition, value)) {
        return { status: "invalid-value" };
      }
      for (const repositoryId of repositoryIds) {
        values.push({
          repositoryId,
          propertyId: definition.propertyId,
          value,
          source: hasExplicit ? "explicit" : "default",
        });
      }
    }
    await this.repository.setRepositoryValues(
      repositoryIds,
      values,
      actorAccountId,
    );
    return { status: "updated" };
  }

  search(organizationId: string, propertyName: string, value: string) {
    return this.repository.searchRepositoryIds(
      organizationId,
      propertyName,
      value,
    );
  }
}
