import type { TeamMemberView } from "../../../domain/organization-team";

export type ListTeamMembersQuery = Readonly<{
  actorAccountId: string;
  teamId: string;
}>;

export type ListTeamMembersResult =
  | Readonly<{ status: "found"; members: readonly TeamMemberView[] }>
  | Readonly<{ status: "team-not-found" }>;

export interface ListTeamMembersUseCase {
  listTeamMembers(query: ListTeamMembersQuery): Promise<ListTeamMembersResult>;
}
