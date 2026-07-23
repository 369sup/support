export type OrganizationReference = Readonly<{
  organizationId: string;
  login: string;
  displayName: string;
  lifecycleState: "active" | "suspended" | "deleted";
}>;

export type OrganizationOwnerReference = Readonly<{
  organizationId: string;
  login: string;
}>;

export type OrganizationLookupResult =
  | Readonly<{ status: "found"; organization: OrganizationReference }>
  | Readonly<{ status: "organization-not-found" }>;
