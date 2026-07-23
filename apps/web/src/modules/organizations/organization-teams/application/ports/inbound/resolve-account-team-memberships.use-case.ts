import type { EffectiveTeamMembershipReference } from "../../../contracts/organization-team-reference";

export type ResolveAccountTeamMembershipsQuery = Readonly<{
  accountId: string;
  organizationId: string;
}>;

export type ResolveAccountTeamMembershipsResult = readonly EffectiveTeamMembershipReference[];

export interface ResolveAccountTeamMembershipsUseCase {
  resolveAccountTeamMemberships(
    query: ResolveAccountTeamMembershipsQuery,
  ): Promise<ResolveAccountTeamMembershipsResult>;
}
