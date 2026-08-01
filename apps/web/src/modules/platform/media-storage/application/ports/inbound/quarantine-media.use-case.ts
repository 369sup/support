import type { MediaObjectReference } from "../../../domain/media-object";

export type QuarantineMediaCommand = Readonly<{
  expectedVersion: number;
  mediaId: string;
}>;

export type QuarantineMediaResult =
  | Readonly<{ status: "quarantined"; media: MediaObjectReference }>
  | Readonly<{ status: "media-not-found" }>
  | Readonly<{ status: "version-conflict"; currentVersion: number }>;

export interface QuarantineMediaUseCase {
  quarantineMedia(
    command: QuarantineMediaCommand,
  ): Promise<QuarantineMediaResult>;
}
