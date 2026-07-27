import type {
  RenameRepositoryResult,
  RenameRepositoryUseCase,
} from "../ports/inbound/rename-repository.use-case";
import type {
  RenameRepositoryCommand,
} from "../ports/inbound/repository-management.types";
import type { RepositoryManagementService } from "../services/repository-management.service";

export class RenameRepositoryHandler implements RenameRepositoryUseCase {
  private readonly service: RepositoryManagementService;

  constructor(service: RepositoryManagementService) {
    this.service = service;
  }

  renameRepository(
    command: RenameRepositoryCommand,
  ): Promise<RenameRepositoryResult> {
    return this.service.renameRepository(command);
  }
}
