import type {
  CreateEmptyRepositoryResult,
  CreateEmptyRepositoryUseCase,
} from "../ports/inbound/create-empty-repository.use-case";
import type {
  CreateEmptyRepositoryCommand,
} from "../ports/inbound/repository-management.types";
import type { RepositoryManagementService } from "../services/repository-management.service";

export class CreateEmptyRepositoryHandler
  implements CreateEmptyRepositoryUseCase
{
  private readonly service: RepositoryManagementService;

  constructor(service: RepositoryManagementService) {
    this.service = service;
  }

  createEmptyRepository(
    command: CreateEmptyRepositoryCommand,
  ): Promise<CreateEmptyRepositoryResult> {
    return this.service.createEmptyRepository(command);
  }
}
