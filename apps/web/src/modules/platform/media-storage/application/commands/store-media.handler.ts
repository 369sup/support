import { toMediaObjectReference } from "../mappers/media-reference.mapper";
import type {
  StoreMediaCommand,
  StoreMediaResult,
  StoreMediaUseCase,
} from "../ports/inbound/store-media.use-case";
import type { MediaClockPort } from "../ports/outbound/media-clock.port";
import type { MediaHasherPort } from "../ports/outbound/media-hasher.port";
import type { MediaIdGeneratorPort } from "../ports/outbound/media-id-generator.port";
import type { MediaObjectRepositoryPort } from "../ports/outbound/media-object.repository.port";

export class StoreMediaHandler implements StoreMediaUseCase {
  private readonly repository: MediaObjectRepositoryPort;
  private readonly clock: MediaClockPort;
  private readonly hasher: MediaHasherPort;
  private readonly idGenerator: MediaIdGeneratorPort;

  constructor(
    repository: MediaObjectRepositoryPort,
    clock: MediaClockPort,
    hasher: MediaHasherPort,
    idGenerator: MediaIdGeneratorPort,
  ) {
    this.repository = repository;
    this.clock = clock;
    this.hasher = hasher;
    this.idGenerator = idGenerator;
  }

  async storeMedia(command: StoreMediaCommand): Promise<StoreMediaResult> {
    const mediaId = this.idGenerator.nextMediaId();
    const media = {
      byteLength: command.content.byteLength,
      checksum: this.hasher.checksum(command.content),
      classification: command.classification,
      content: command.content.slice(),
      contentType: command.contentType,
      createdAt: this.clock.now(),
      deletedAt: null,
      mediaId,
      state: "active" as const,
      storageKey: this.idGenerator.storageKey(mediaId),
      version: 1,
    };
    await this.repository.save(media);
    return { status: "stored", media: toMediaObjectReference(media) };
  }
}
