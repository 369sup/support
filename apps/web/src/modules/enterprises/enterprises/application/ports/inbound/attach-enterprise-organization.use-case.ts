export type AttachEnterpriseOrganizationCommand = Readonly<{
  enterpriseId: string;
  organizationId: string;
}>;

export type AttachEnterpriseOrganizationResult = Readonly<{
  status:
    | "attached"
    | "organization-already-attached"
    | "service-unavailable";
}>;

export interface AttachEnterpriseOrganizationUseCase {
  attachEnterpriseOrganization(
    command: AttachEnterpriseOrganizationCommand,
  ): Promise<AttachEnterpriseOrganizationResult>;
}
