export type OrganizationQuerySnapshot = Readonly<{
  organizationId: string;
  login: string;
  displayName: string;
  lifecycleState: "active" | "suspended" | "deleted";
}>;

export interface OrganizationQueryRepositoryPort {
  findById(organizationId: string): Promise<OrganizationQuerySnapshot | null>;
  findByLogin(login: string): Promise<OrganizationQuerySnapshot | null>;
}
