import type {
  OrganizationTeamReference,
  TeamVisibility,
} from "../../../contracts/organization-team-reference";

export type CreateOrganizationTeamCommand = Readonly<{
  actorAccountId: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  visibility: TeamVisibility;
  parentTeamId?: string | null;
}>;

export type CreateOrganizationTeamResult =
  | Readonly<{ status: "created"; team: OrganizationTeamReference }>
  | Readonly<{
      status:
        | "organization-not-found"
        | "membership-inactive"
        | "permission-denied"
        | "team-slug-conflict"
        | "parent-team-invalid"
        | "secret-team-cannot-be-nested";
    }>;

export interface CreateOrganizationTeamUseCase {
  createOrganizationTeam(
    command: CreateOrganizationTeamCommand,
  ): Promise<CreateOrganizationTeamResult>;
}
