import type {
  GetRepositoryForAdministrationResult,
  GetRepositoryForAdministrationUseCase,
} from "../ports/inbound/get-repository-for-administration.use-case";
import type {
  GetRepositoryForAdministrationQuery,
} from "../ports/inbound/repository-management.types";
import type { RepositoryManagementService } from "../services/repository-management.service";

export class GetRepositoryForAdministrationHandler
  implements GetRepositoryForAdministrationUseCase
{
  private readonly service: RepositoryManagementService;

  constructor(service: RepositoryManagementService) {
    this.service = service;
  }

  getRepositoryForAdministration(
    query: GetRepositoryForAdministrationQuery,
  ): Promise<GetRepositoryForAdministrationResult> {
    return this.service.getRepositoryForAdministration(query);
  }
}
