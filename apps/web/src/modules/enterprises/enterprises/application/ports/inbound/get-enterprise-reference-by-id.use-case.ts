import type { EnterpriseQuerySnapshot } from "../outbound/enterprise-query.repository.port";

export type GetEnterpriseReferenceByIdQuery = Readonly<{
  enterpriseId: string;
}>;
export type GetEnterpriseReferenceByIdResult =
  | Readonly<{ status: "found"; enterprise: EnterpriseQuerySnapshot }>
  | Readonly<{ status: "enterprise-not-found" }>;

export interface GetEnterpriseReferenceByIdUseCase {
  getEnterpriseReferenceById(
    query: GetEnterpriseReferenceByIdQuery,
  ): Promise<GetEnterpriseReferenceByIdResult>;
}
