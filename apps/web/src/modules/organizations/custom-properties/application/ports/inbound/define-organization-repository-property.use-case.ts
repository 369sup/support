import type { DefineOrganizationRepositoryPropertyInput } from "../../../domain/custom-property";

export type DefineOrganizationRepositoryPropertyResult =
  | Readonly<{ status: "defined"; propertyId: string }>
  | Readonly<{
      status:
        | "invalid-name"
        | "invalid-description"
        | "invalid-allowed-values"
        | "invalid-default-value"
        | "name-conflict";
    }>;

export interface DefineOrganizationRepositoryPropertyUseCase {
  defineOrganizationRepositoryProperty(
    command: DefineOrganizationRepositoryPropertyInput,
  ): Promise<DefineOrganizationRepositoryPropertyResult>;
}
