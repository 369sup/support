export type DeleteMediaCommand = Readonly<{
  expectedVersion: number;
  mediaId: string;
}>;

export type DeleteMediaResult =
  | Readonly<{ status: "deleted" }>
  | Readonly<{ status: "media-not-found" }>
  | Readonly<{ status: "version-conflict"; currentVersion: number }>;

export interface DeleteMediaUseCase {
  deleteMedia(command: DeleteMediaCommand): Promise<DeleteMediaResult>;
}
