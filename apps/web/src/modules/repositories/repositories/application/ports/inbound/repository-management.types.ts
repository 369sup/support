export type RepositoryCommandInput = Readonly<{
  actorAccountId: string;
  ownerId: string;
  name: string;
}>;

export type CreateEmptyRepositoryCommand = Readonly<{
  actorAccountId: string;
  ownerId: string;
  name: string;
  description: string;
  visibility: string;
}>;

export type RenameRepositoryCommand = RepositoryCommandInput &
  Readonly<{ newName: string }>;

export type ChangeRepositoryVisibilityCommand = RepositoryCommandInput &
  Readonly<{ visibility: string }>;

export type ConfirmRepositoryLifecycleCommand = RepositoryCommandInput &
  Readonly<{ confirmation: string }>;

export type GetRepositoryForAdministrationQuery = RepositoryCommandInput;
