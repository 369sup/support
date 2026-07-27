import type { EnterpriseTeamOrganizationGrantReference } from "../../../domain/enterprise-team";

export type UnassignEnterpriseTeamFromOrganizationCommand = Readonly<{
  actorAccountId: string;
  enterpriseSlug: string;
  teamId: string;
  organizationId: string;
}>;

export type UnassignEnterpriseTeamFromOrganizationResult =
  | Readonly<{
      status: "unassigned";
      grant: EnterpriseTeamOrganizationGrantReference;
    }>
  | Readonly<{
      status:
        | "assignment-not-found"
        | "enterprise-not-found"
        | "permission-denied"
        | "team-not-found";
    }>;

export interface UnassignEnterpriseTeamFromOrganizationUseCase {
  unassignEnterpriseTeamFromOrganization(
    command: UnassignEnterpriseTeamFromOrganizationCommand,
  ): Promise<UnassignEnterpriseTeamFromOrganizationResult>;
}
