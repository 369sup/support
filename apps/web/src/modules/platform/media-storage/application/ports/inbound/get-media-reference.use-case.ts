import type { MediaObjectReference } from "../../../domain/media-object";

export type GetMediaReferenceQuery = Readonly<{ mediaId: string }>;

export type GetMediaReferenceResult =
  | Readonly<{ status: "found"; media: MediaObjectReference }>
  | Readonly<{ status: "media-not-found" }>;

export interface GetMediaReferenceUseCase {
  getMediaReference(
    query: GetMediaReferenceQuery,
  ): Promise<GetMediaReferenceResult>;
}
