export interface OrganizationTeamGatewayPort {
  isActiveTeam(input: {
    actorAccountId: string;
    organizationId: string;
    teamId: string;
  }): Promise<boolean>;
  listDirectTeamIdsForAccount(
    accountId: string,
    organizationId: string,
  ): Promise<readonly string[]>;
}
