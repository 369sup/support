import type {
  MediaObject,
  MediaObjectReference,
} from "../../domain/media-object";

export function toMediaObjectReference(
  media: MediaObject,
): MediaObjectReference {
  if (media.state === "deleted") {
    throw new Error("Deleted media cannot be mapped to a public reference.");
  }
  return {
    byteLength: media.byteLength,
    checksum: media.checksum,
    classification: media.classification,
    contentType: media.contentType,
    mediaId: media.mediaId,
    state: media.state,
    storageKey: media.storageKey,
    version: media.version,
  };
}
