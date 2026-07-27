import type {
  RestoreDeletedRepositoryResult,
  RestoreDeletedRepositoryUseCase,
} from "../ports/inbound/restore-deleted-repository.use-case";
import type {
  ConfirmRepositoryLifecycleCommand,
} from "../ports/inbound/repository-management.types";
import type { RepositoryManagementService } from "../services/repository-management.service";

export class RestoreDeletedRepositoryHandler
  implements RestoreDeletedRepositoryUseCase
{
  private readonly service: RepositoryManagementService;

  constructor(service: RepositoryManagementService) {
    this.service = service;
  }

  restoreDeletedRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<RestoreDeletedRepositoryResult> {
    return this.service.restoreDeletedRepository(command);
  }
}
