import type { OrganizationReference } from "@/modules/organizations/organizations/integration-contracts";

export type EnterpriseReference = Readonly<{
  enterpriseId: string;
  slug: string;
  displayName: string;
  enterpriseType: "standard" | "managed-users";
  lifecycleState: "active" | "suspended" | "deleted";
}>;

export type EnterpriseLookupResult =
  | Readonly<{ status: "found"; enterprise: EnterpriseReference }>
  | Readonly<{ status: "enterprise-not-found" }>;

export type EnterpriseOrganizationsResult =
  | Readonly<{
      status: "found";
      enterprise: EnterpriseReference;
      organizations: readonly OrganizationReference[];
    }>
  | Readonly<{ status: "enterprise-not-found" }>;
