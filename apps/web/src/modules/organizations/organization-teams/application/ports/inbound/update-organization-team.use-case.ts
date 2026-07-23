import type {
  OrganizationTeamReference,
  TeamVisibility,
} from "../../../domain/organization-team";

export type UpdateOrganizationTeamCommand = Readonly<{
  actorAccountId: string;
  teamId: string;
  name?: string;
  slug?: string;
  description?: string;
  visibility?: TeamVisibility;
  parentTeamId?: string | null;
}>;

export type UpdateOrganizationTeamResult =
  | Readonly<{ status: "updated"; team: OrganizationTeamReference }>
  | Readonly<{
      status:
        | "team-not-found"
        | "permission-denied"
        | "team-slug-conflict"
        | "parent-team-invalid"
        | "team-hierarchy-cycle"
        | "secret-team-cannot-be-nested";
    }>;

export interface UpdateOrganizationTeamUseCase {
  updateOrganizationTeam(
    command: UpdateOrganizationTeamCommand,
  ): Promise<UpdateOrganizationTeamResult>;
}
