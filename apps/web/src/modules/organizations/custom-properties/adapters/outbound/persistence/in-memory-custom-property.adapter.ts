import type { CustomPropertyRepositoryPort } from "../../../application/ports/outbound/custom-property.repository.port";
import type {
  OrganizationRepositoryPropertyDefinition,
  RepositoryPropertyValue,
} from "../../../domain/custom-property";

export class InMemoryCustomPropertyAdapter
  implements CustomPropertyRepositoryPort
{
  private readonly definitions = new Map<
    string,
    OrganizationRepositoryPropertyDefinition
  >();
  private readonly values = new Map<string, RepositoryPropertyValue>();

  define(definition: OrganizationRepositoryPropertyDefinition) {
    const key = `${definition.organizationId}\u0000${definition.name.toLowerCase()}`;
    if (this.definitions.has(key)) {
      return Promise.resolve("name-conflict" as const);
    }
    this.definitions.set(key, definition);
    return Promise.resolve("defined" as const);
  }

  listDefinitions(organizationId: string) {
    return Promise.resolve(
      [...this.definitions.values()].filter(
        (definition) => definition.organizationId === organizationId,
      ),
    );
  }

  setRepositoryValues(
    _repositoryIds: readonly string[],
    values: readonly RepositoryPropertyValue[],
  ): Promise<void> {
    for (const value of values) {
      this.values.set(`${value.repositoryId}\u0000${value.propertyId}`, value);
    }
    return Promise.resolve();
  }

  searchRepositoryIds(
    organizationId: string,
    propertyName: string,
    value: string,
  ): Promise<readonly string[]> {
    const definition = [...this.definitions.values()].find(
      (candidate) =>
        candidate.organizationId === organizationId &&
        candidate.name.toLowerCase() === propertyName.toLowerCase(),
    );
    if (definition === undefined) {
      return Promise.resolve([]);
    }
    return Promise.resolve(
      [...this.values.values()]
        .filter(
          (candidate) =>
            candidate.propertyId === definition.propertyId &&
            (candidate.value === value ||
              (Array.isArray(candidate.value) &&
                candidate.value.includes(value))),
        )
        .map((candidate) => candidate.repositoryId),
    );
  }
}
