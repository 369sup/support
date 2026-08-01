export type AccountTeamPermissionSnapshot = Readonly<{
  directTeamId: string;
  ancestorTeamIds: readonly string[];
  isMaintainer: boolean;
}>;

export type RepositoryAccessTeamSnapshot = Readonly<{
  teamId: string;
  organizationId: string;
  parentTeamId: string | null;
  isMaintainer: boolean;
}>;

export interface OrganizationTeamGatewayPort {
  listAccountTeamPermissions(
    accountId: string,
    organizationId: string,
  ): Promise<readonly AccountTeamPermissionSnapshot[]>;
  getTeamForActor(input: {
    actorAccountId: string;
    organizationId: string;
    teamId: string;
  }): Promise<RepositoryAccessTeamSnapshot | null>;
  listAncestorTeamIds(input: {
    actorAccountId: string;
    organizationId: string;
    teamId: string;
  }): Promise<readonly string[]>;
}
