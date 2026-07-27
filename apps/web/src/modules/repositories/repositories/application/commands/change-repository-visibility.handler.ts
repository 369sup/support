import type {
  ChangeRepositoryVisibilityResult,
  ChangeRepositoryVisibilityUseCase,
} from "../ports/inbound/change-repository-visibility.use-case";
import type {
  ChangeRepositoryVisibilityCommand,
} from "../ports/inbound/repository-management.types";
import type { RepositoryManagementService } from "../services/repository-management.service";

export class ChangeRepositoryVisibilityHandler
  implements ChangeRepositoryVisibilityUseCase
{
  private readonly service: RepositoryManagementService;

  constructor(service: RepositoryManagementService) {
    this.service = service;
  }

  changeRepositoryVisibility(
    command: ChangeRepositoryVisibilityCommand,
  ): Promise<ChangeRepositoryVisibilityResult> {
    return this.service.changeRepositoryVisibility(command);
  }
}
