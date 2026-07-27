import type {
  ArchiveRepositoryResult,
  ArchiveRepositoryUseCase,
} from "../ports/inbound/archive-repository.use-case";
import type {
  ConfirmRepositoryLifecycleCommand,
} from "../ports/inbound/repository-management.types";
import type { RepositoryManagementService } from "../services/repository-management.service";

export class ArchiveRepositoryHandler implements ArchiveRepositoryUseCase {
  private readonly service: RepositoryManagementService;

  constructor(service: RepositoryManagementService) {
    this.service = service;
  }

  archiveRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<ArchiveRepositoryResult> {
    return this.service.archiveRepository(command);
  }
}
