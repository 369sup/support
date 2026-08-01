export type CreateEnterpriseCommand = Readonly<{
  actorAccountId: string;
  slug: string;
  displayName: string;
}>;

export type CreateEnterpriseResult =
  | Readonly<{ status: "created"; enterpriseId: string; slug: string }>
  | Readonly<{
      status:
        | "invalid-slug"
        | "invalid-display-name"
        | "slug-conflict"
        | "service-unavailable";
    }>;

export interface CreateEnterpriseUseCase {
  createEnterprise(
    command: CreateEnterpriseCommand,
  ): Promise<CreateEnterpriseResult>;
}
