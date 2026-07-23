import type {
  AuthorizeEnterpriseAdministrationQuery,
  AuthorizeEnterpriseAdministrationResult,
  AuthorizeEnterpriseAdministrationUseCase,
} from "../ports/inbound/authorize-enterprise-administration.use-case";
import type { EnterpriseAffiliationGatewayPort } from "../ports/outbound/enterprise-affiliation.gateway.port";
import type { EnterpriseRoleAssignmentRepositoryPort } from "../ports/outbound/enterprise-role-assignment.repository.port";

export class AuthorizeEnterpriseAdministrationHandler
  implements AuthorizeEnterpriseAdministrationUseCase
{
  private readonly affiliationGateway: EnterpriseAffiliationGatewayPort;
  private readonly assignmentRepository: EnterpriseRoleAssignmentRepositoryPort;

  constructor(
    affiliationGateway: EnterpriseAffiliationGatewayPort,
    assignmentRepository: EnterpriseRoleAssignmentRepositoryPort,
  ) {
    this.affiliationGateway = affiliationGateway;
    this.assignmentRepository = assignmentRepository;
  }

  async authorizeEnterpriseAdministration(
    query: AuthorizeEnterpriseAdministrationQuery,
  ): Promise<AuthorizeEnterpriseAdministrationResult> {
    const isAffiliated = await this.affiliationGateway.hasActiveAffiliation(
      query.accountId,
      query.enterpriseId,
    );

    if (!isAffiliated) {
      return { status: "denied", reason: "membership-inactive" };
    }

    const assignments =
      await this.assignmentRepository.findByAccountAndEnterprise(
        query.accountId,
        query.enterpriseId,
      );
    const assignment = assignments.find((candidate) =>
      candidate.permissions.includes("view-enterprise"),
    );

    if (assignment === undefined) {
      return { status: "denied", reason: "permission-missing" };
    }

    return {
      status: "allowed",
      roleName: assignment.roleName,
      permissions: ["view-enterprise"],
    };
  }
}
