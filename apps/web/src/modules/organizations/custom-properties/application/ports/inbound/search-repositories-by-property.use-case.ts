export interface SearchRepositoriesByPropertyUseCase {
  searchRepositoriesByProperty(
    organizationId: string,
    propertyName: string,
    value: string,
  ): Promise<readonly string[]>;
}
