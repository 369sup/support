import type { EnterpriseQuerySnapshot } from "../outbound/enterprise-query.repository.port";

export type GetEnterpriseBySlugQuery = Readonly<{ slug: string }>;
export type GetEnterpriseBySlugResult =
  | Readonly<{ status: "found"; enterprise: EnterpriseQuerySnapshot }>
  | Readonly<{ status: "enterprise-not-found" }>;

export interface GetEnterpriseBySlugUseCase {
  getEnterpriseBySlug(
    query: GetEnterpriseBySlugQuery,
  ): Promise<GetEnterpriseBySlugResult>;
}
