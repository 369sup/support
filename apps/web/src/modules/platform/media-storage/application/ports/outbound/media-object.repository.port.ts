import type { MediaObject } from "../../../domain/media-object";

export interface MediaObjectRepositoryPort {
  findById(mediaId: string): Promise<MediaObject | null>;
  save(media: MediaObject): Promise<void>;
}
