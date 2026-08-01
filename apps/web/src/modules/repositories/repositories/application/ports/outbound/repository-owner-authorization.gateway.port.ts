export type AuthorizedRepositoryOwner = Readonly<{
  kind: "personal" | "organization";
  id: string;
  login: string;
}>;

export interface RepositoryOwnerAuthorizationGatewayPort {
  authorizeOwner(
    actorAccountId: string,
    ownerId: string,
  ): Promise<AuthorizedRepositoryOwner | null>;
}
