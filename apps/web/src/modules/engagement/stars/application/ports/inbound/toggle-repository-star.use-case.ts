export type ToggleRepositoryStarCommand = Readonly<{
  repositoryId: string;
  actorAccountId: string;
  actorUsername: string;
  changedAt: string;
}>;

export type ToggleRepositoryStarResult =
  | Readonly<{ status: "updated"; isStarred: boolean }>
  | Readonly<{ status: "invalid-star" }>;

export interface ToggleRepositoryStarUseCase {
  toggleRepositoryStar(
    command: ToggleRepositoryStarCommand,
  ): Promise<ToggleRepositoryStarResult>;
}
