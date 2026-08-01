import type {
  EnterpriseTeamOrganizationAssignmentView,
} from "../../../domain/enterprise-team";
import type { EnterpriseTeamOrganizationMembershipReference } from "../outbound/organization-membership.gateway.port";

export type AssignEnterpriseTeamToOrganizationCommand = Readonly<{
  actorAccountId: string;
  enterpriseSlug: string;
  teamId: string;
  organizationId: string;
}>;

export type AssignEnterpriseTeamToOrganizationResult =
  | Readonly<{
      status: "assigned";
      assignment: EnterpriseTeamOrganizationAssignmentView;
      memberships: readonly EnterpriseTeamOrganizationMembershipReference[];
    }>
  | Readonly<{
      status:
        | "already-assigned"
        | "enterprise-not-found"
        | "organization-assignment-limit-reached"
        | "organization-not-found"
        | "permission-denied"
        | "team-not-found";
    }>;

export interface AssignEnterpriseTeamToOrganizationUseCase {
  assignEnterpriseTeamToOrganization(
    command: AssignEnterpriseTeamToOrganizationCommand,
  ): Promise<AssignEnterpriseTeamToOrganizationResult>;
}
