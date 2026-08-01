export type TeamVisibility = "visible" | "secret";

export type OrganizationTeamReference = Readonly<{
  teamId: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  visibility: TeamVisibility;
  parentTeamId: string | null;
  lifecycleState: "active" | "deleted";
}>;

export type TeamMembershipReference = Readonly<{
  teamMembershipId: string;
  teamId: string;
  organizationId: string;
  accountId: string;
  state: "active" | "removed";
}>;

export type TeamMaintainerReference = Readonly<{
  teamMaintainerId: string;
  teamId: string;
  organizationId: string;
  accountId: string;
  state: "active" | "revoked";
}>;

export type TeamMemberView = Readonly<{
  membership: TeamMembershipReference;
  isMaintainer: boolean;
}>;

export type EffectiveTeamMembershipReference = Readonly<{
  membership: TeamMembershipReference;
  ancestorTeamIds: readonly string[];
  isMaintainer: boolean;
}>;
