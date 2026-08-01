export type OrganizationTeamCreatedV1 = Readonly<{
  organizationId: string;
  teamId: string;
}>;

export type OrganizationTeamUpdatedV1 = OrganizationTeamCreatedV1;
export type OrganizationTeamDeletedV1 = OrganizationTeamCreatedV1;

export type TeamMemberAddedV1 = Readonly<{
  accountId: string;
  organizationId: string;
  teamId: string;
}>;

export type TeamMemberRemovedV1 = TeamMemberAddedV1;

export type TeamMaintainerChangedV1 = TeamMemberAddedV1 &
  Readonly<{ action: "assigned" | "revoked" }>;

export type ParentTeamChangedV1 = Readonly<{
  parentTeamId: string | null;
  teamId: string;
}>;

export type TeamVisibilityChangedV1 = Readonly<{
  teamId: string;
  visibility: "visible" | "secret";
}>;
