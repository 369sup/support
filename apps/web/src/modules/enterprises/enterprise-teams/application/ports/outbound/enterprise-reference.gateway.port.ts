export type ActiveEnterpriseReference = Readonly<{
  enterpriseId: string;
  slug: string;
}>;

export interface EnterpriseReferenceGatewayPort {
  getActiveEnterpriseBySlug(
    enterpriseSlug: string,
  ): Promise<ActiveEnterpriseReference | null>;
}
