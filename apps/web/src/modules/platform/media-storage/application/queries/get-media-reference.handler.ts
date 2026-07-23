import { toMediaObjectReference } from "../mappers/media-reference.mapper";
import type {
  GetMediaReferenceQuery,
  GetMediaReferenceResult,
  GetMediaReferenceUseCase,
} from "../ports/inbound/get-media-reference.use-case";
import type { MediaObjectRepositoryPort } from "../ports/outbound/media-object.repository.port";

export class GetMediaReferenceHandler implements GetMediaReferenceUseCase {
  private readonly repository: MediaObjectRepositoryPort;

  constructor(repository: MediaObjectRepositoryPort) {
    this.repository = repository;
  }

  async getMediaReference(
    query: GetMediaReferenceQuery,
  ): Promise<GetMediaReferenceResult> {
    const media = await this.repository.findById(query.mediaId);
    if (media === null || media.state === "deleted") {
      return { status: "media-not-found" };
    }
    return { status: "found", media: toMediaObjectReference(media) };
  }
}
