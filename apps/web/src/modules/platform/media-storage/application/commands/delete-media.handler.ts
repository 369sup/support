import type {
  DeleteMediaCommand,
  DeleteMediaResult,
  DeleteMediaUseCase,
} from "../ports/inbound/delete-media.use-case";
import type { MediaClockPort } from "../ports/outbound/media-clock.port";
import type { MediaObjectRepositoryPort } from "../ports/outbound/media-object.repository.port";

export class DeleteMediaHandler implements DeleteMediaUseCase {
  private readonly repository: MediaObjectRepositoryPort;
  private readonly clock: MediaClockPort;

  constructor(repository: MediaObjectRepositoryPort, clock: MediaClockPort) {
    this.repository = repository;
    this.clock = clock;
  }

  async deleteMedia(command: DeleteMediaCommand): Promise<DeleteMediaResult> {
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
    await this.repository.save({
      ...current,
      content: new Uint8Array(),
      deletedAt: this.clock.now(),
      state: "deleted",
      version: current.version + 1,
    });
    return { status: "deleted" };
  }
}
