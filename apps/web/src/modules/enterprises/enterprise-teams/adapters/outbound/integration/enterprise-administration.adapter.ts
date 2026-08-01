import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import type { EnterpriseAdministrationGatewayPort } from "../../../application/ports/outbound/enterprise-administration.gateway.port";

export class EnterpriseAdministrationAdapter
  implements EnterpriseAdministrationGatewayPort
{
  async canManageEnterpriseTeams(
    actorAccountId: string,
    enterpriseId: string,
  ) {
    const decision = await authorizeEnterpriseAdministration({
      accountId: actorAccountId,
      enterpriseId,
    });
    return (
      decision.status === "allowed" &&
      decision.roleName === "enterprise-owner"
    );
  }

  async canViewEnterpriseTeams(
    actorAccountId: string,
    enterpriseId: string,
  ) {
    const decision = await authorizeEnterpriseAdministration({
      accountId: actorAccountId,
      enterpriseId,
    });
    return decision.status === "allowed";
  }
}
