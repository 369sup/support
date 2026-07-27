import type {
  UnarchiveRepositoryResult,
  UnarchiveRepositoryUseCase,
} from "../ports/inbound/unarchive-repository.use-case";
import type {
  ConfirmRepositoryLifecycleCommand,
} from "../ports/inbound/repository-management.types";
import type { RepositoryManagementService } from "../services/repository-management.service";

export class UnarchiveRepositoryHandler
  implements UnarchiveRepositoryUseCase
{
  private readonly service: RepositoryManagementService;

  constructor(service: RepositoryManagementService) {
    this.service = service;
  }

  unarchiveRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<UnarchiveRepositoryResult> {
    return this.service.unarchiveRepository(command);
  }
}
