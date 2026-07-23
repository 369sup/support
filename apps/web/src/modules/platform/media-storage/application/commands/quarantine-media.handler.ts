import { toMediaObjectReference } from "../mappers/media-reference.mapper";
import type {
  QuarantineMediaCommand,
  QuarantineMediaResult,
  QuarantineMediaUseCase,
} from "../ports/inbound/quarantine-media.use-case";
import type { MediaObjectRepositoryPort } from "../ports/outbound/media-object.repository.port";

export class QuarantineMediaHandler implements QuarantineMediaUseCase {
  private readonly repository: MediaObjectRepositoryPort;

  constructor(repository: MediaObjectRepositoryPort) {
    this.repository = repository;
  }

  async quarantineMedia(
    command: QuarantineMediaCommand,
  ): Promise<QuarantineMediaResult> {
    const current = await this.repository.findById(command.mediaId);
    if (current === null || current.state === "deleted") {
      return { status: "media-not-found" };
    }
    if (current.version !== command.expectedVersion) {
      return {
        status: "version-conflict",
        currentVersion: current.version,
      };
    }
    const media = {
      ...current,
      state: "quarantined" as const,
      version: current.version + 1,
    };
    await this.repository.save(media);
    return { status: "quarantined", media: toMediaObjectReference(media) };
  }
}
