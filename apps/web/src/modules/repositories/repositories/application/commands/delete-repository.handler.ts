import type {
  DeleteRepositoryResult,
  DeleteRepositoryUseCase,
} from "../ports/inbound/delete-repository.use-case";
import type {
  ConfirmRepositoryLifecycleCommand,
} from "../ports/inbound/repository-management.types";
import type { RepositoryManagementService } from "../services/repository-management.service";

export class DeleteRepositoryHandler implements DeleteRepositoryUseCase {
  private readonly service: RepositoryManagementService;

  constructor(service: RepositoryManagementService) {
    this.service = service;
  }

  deleteRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<DeleteRepositoryResult> {
    return this.service.deleteRepository(command);
  }
}
