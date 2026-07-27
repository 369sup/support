import type { OrganizationMembershipClockPort } from "../../../application/ports/outbound/organization-membership-clock.port";

export class SystemOrganizationMembershipClockAdapter
  implements OrganizationMembershipClockPort
{
  now(): Date {
    return new Date();
  }
}
