import { customPropertiesServerFacade } from "./composition/custom-properties.composition";

export type {
  CustomPropertyValue,
  DefineOrganizationRepositoryPropertyInput,
  OrganizationRepositoryPropertyDefinition,
  RepositoryPropertyValue,
} from "./contracts/custom-property";
export const defineOrganizationRepositoryProperty =
  customPropertiesServerFacade.defineOrganizationRepositoryProperty;
export const listOrganizationRepositoryProperties =
  customPropertiesServerFacade.listOrganizationRepositoryProperties;
export const searchRepositoriesByProperty =
  customPropertiesServerFacade.searchRepositoriesByProperty;
export const setRepositoryPropertyValues =
  customPropertiesServerFacade.setRepositoryPropertyValues;
