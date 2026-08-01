import type { OrganizationQuerySnapshot } from "../outbound/organization-query.repository.port";

export type GetOrganizationReferenceByIdQuery = Readonly<{
  organizationId: string;
}>;
export type GetOrganizationReferenceByIdResult =
  | Readonly<{ status: "found"; organization: OrganizationQuerySnapshot }>
  | Readonly<{ status: "organization-not-found" }>;

export interface GetOrganizationReferenceByIdUseCase {
  getOrganizationReferenceById(
    query: GetOrganizationReferenceByIdQuery,
  ): Promise<GetOrganizationReferenceByIdResult>;
}
