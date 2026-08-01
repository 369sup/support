export type RepositoryGrantSnapshot = Readonly<{
  grantId: string;
  repositoryId: string;
  accountId: string;
  permission: "read" | "triage" | "write" | "maintain" | "admin";
  state: "active" | "revoked";
}>;

export interface RepositoryGrantRepositoryPort {
  findActiveByRepositoryAndAccount(
    repositoryId: string,
    accountId: string,
  ): Promise<readonly RepositoryGrantSnapshot[]>;
}
