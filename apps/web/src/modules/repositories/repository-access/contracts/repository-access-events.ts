export type TeamRepositoryAccessGrantedV1 = Readonly<{
  grantId: string;
  organizationId: string;
  permission: "read" | "triage" | "write" | "maintain" | "admin";
  repositoryId: string;
  state: "active";
  teamId: string;
}>;

export type TeamRepositoryAccessRevokedV1 = Omit<
  TeamRepositoryAccessGrantedV1,
  "state"
> &
  Readonly<{ state: "revoked" }>;
