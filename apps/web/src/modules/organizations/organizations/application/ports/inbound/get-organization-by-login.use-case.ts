import type { OrganizationQuerySnapshot } from "../outbound/organization-query.repository.port";

export type GetOrganizationByLoginQuery = Readonly<{ login: string }>;
export type GetOrganizationByLoginResult =
  | Readonly<{ status: "found"; organization: OrganizationQuerySnapshot }>
  | Readonly<{ status: "organization-not-found" }>;

export interface GetOrganizationByLoginUseCase {
  getOrganizationByLogin(
    query: GetOrganizationByLoginQuery,
  ): Promise<GetOrganizationByLoginResult>;
}
