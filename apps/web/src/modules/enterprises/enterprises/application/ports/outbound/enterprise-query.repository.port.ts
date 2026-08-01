export type EnterpriseQuerySnapshot = Readonly<{
  enterpriseId: string;
  slug: string;
  displayName: string;
  enterpriseType: "standard" | "managed-users";
  lifecycleState: "active" | "suspended" | "deleted";
}>;

export interface EnterpriseQueryRepositoryPort {
  findBySlug(slug: string): Promise<EnterpriseQuerySnapshot | null>;
  findOrganizationIds(
    enterpriseId: string,
  ): Promise<readonly string[]>;
}
