import type {
  UpdateRepositoryProfileResult,
  UpdateRepositoryProfileUseCase,
} from "../ports/inbound/update-repository-profile.use-case";
import type { UpdateRepositoryProfileCommand } from "../ports/inbound/repository-management.types";
import type { RepositoryManagementService } from "../services/repository-management.service";

export class UpdateRepositoryProfileHandler
  implements UpdateRepositoryProfileUseCase
{
  private readonly service: RepositoryManagementService;

  constructor(service: RepositoryManagementService) {
    this.service = service;
  }

  updateRepositoryProfile(
    command: UpdateRepositoryProfileCommand,
  ): Promise<UpdateRepositoryProfileResult> {
    return this.service.updateRepositoryProfile(command);
  }
}
