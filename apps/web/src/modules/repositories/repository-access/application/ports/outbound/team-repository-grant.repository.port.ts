import type { TeamRepositoryGrantReference } from "../../../domain/repository-permission";

export interface TeamRepositoryGrantRepositoryPort {
  findActiveByRepository(
    repositoryId: string,
  ): Promise<readonly TeamRepositoryGrantReference[]>;
  findActiveByRepositoryAndTeam(
    repositoryId: string,
    teamId: string,
  ): Promise<TeamRepositoryGrantReference | null>;
  saveTeamGrant(grant: TeamRepositoryGrantReference): Promise<void>;
}
