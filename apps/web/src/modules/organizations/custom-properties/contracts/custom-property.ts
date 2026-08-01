export type CustomPropertyValue =
  | string
  | boolean
  | readonly string[]
  | null;

export type OrganizationRepositoryPropertyDefinition = Readonly<{
  propertyId: string;
  organizationId: string;
  name: string;
  description: string;
  valueType: "text" | "single-select" | "multi-select" | "true-false";
  allowedValues: readonly string[];
  defaultValue: CustomPropertyValue;
  isRequired: boolean;
  isExplicitValueRequired: boolean;
  canRepositoryActorsSet: boolean;
}>;

export type DefineOrganizationRepositoryPropertyInput = Omit<
  OrganizationRepositoryPropertyDefinition,
  "propertyId"
>;

export type RepositoryPropertyValue = Readonly<{
  repositoryId: string;
  propertyId: string;
  value: CustomPropertyValue;
  source: "explicit" | "default";
}>;
