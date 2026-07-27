import {
  createListActivePublicRepositoriesForPersonalOwnerAdapter,
  type ListActivePublicRepositoriesForPersonalOwnerAdapter,
} from "../adapters/inbound/server/list-active-public-repositories-for-personal-owner.adapter";
import { InMemoryRepositoryQueryAdapter } from "../adapters/outbound/persistence/in-memory-repository-query.adapter";
import { InMemoryRepositoryIdGeneratorAdapter } from "../adapters/outbound/persistence/in-memory-repository-id-generator.adapter";
import { SystemRepositoryClockAdapter } from "../adapters/outbound/persistence/system-repository-clock.adapter";
import { RepositoryOwnerAuthorizationAdapter } from "../adapters/outbound/integration/repository-owner-authorization.adapter";
import { ArchiveRepositoryHandler } from "../application/commands/archive-repository.handler";
import { ChangeRepositoryVisibilityHandler } from "../application/commands/change-repository-visibility.handler";
import { CreateEmptyRepositoryHandler } from "../application/commands/create-empty-repository.handler";
import { DeleteRepositoryHandler } from "../application/commands/delete-repository.handler";
import { GetRepositoryForAdministrationHandler } from "../application/queries/get-repository-for-administration.handler";
import { RenameRepositoryHandler } from "../application/commands/rename-repository.handler";
import { RestoreDeletedRepositoryHandler } from "../application/commands/restore-deleted-repository.handler";
import { UnarchiveRepositoryHandler } from "../application/commands/unarchive-repository.handler";
import type { ArchiveRepositoryUseCase } from "../application/ports/inbound/archive-repository.use-case";
import type { ChangeRepositoryVisibilityUseCase } from "../application/ports/inbound/change-repository-visibility.use-case";
import type { CreateEmptyRepositoryUseCase } from "../application/ports/inbound/create-empty-repository.use-case";
import type { DeleteRepositoryUseCase } from "../application/ports/inbound/delete-repository.use-case";
import type { GetRepositoryForAdministrationUseCase } from "../application/ports/inbound/get-repository-for-administration.use-case";
import type { RenameRepositoryUseCase } from "../application/ports/inbound/rename-repository.use-case";
import type { RestoreDeletedRepositoryUseCase } from "../application/ports/inbound/restore-deleted-repository.use-case";
import type { UnarchiveRepositoryUseCase } from "../application/ports/inbound/unarchive-repository.use-case";
import { GetRepositoryByOwnerAndNameHandler } from "../application/queries/get-repository-by-owner-and-name.handler";
import { ListActivePublicRepositoriesForOrganizationOwnerHandler } from "../application/queries/list-active-public-repositories-for-organization-owner.handler";
import { ListActivePublicRepositoriesForPersonalOwnerHandler } from "../application/queries/list-active-public-repositories-for-personal-owner.handler";
import { ListActiveRepositoriesForOwnerHandler } from "../application/queries/list-active-repositories-for-owner.handler";
import { RepositoryManagementService } from "../application/services/repository-management.service";
import type { RepositoryQuerySnapshot } from "../application/ports/outbound/repository-query.repository.port";
import type {
  RepositoryCandidateReference,
  RepositoryLookupResult,
} from "../contracts/repository-reference";
import type { PublicRepositorySummary } from "../contracts/repository-summary";

export interface RepositoriesServerFacade {
  archiveRepository: ArchiveRepositoryUseCase["archiveRepository"];
  changeRepositoryVisibility: ChangeRepositoryVisibilityUseCase["changeRepositoryVisibility"];
  createEmptyRepository: CreateEmptyRepositoryUseCase["createEmptyRepository"];
  deleteRepository: DeleteRepositoryUseCase["deleteRepository"];
  getRepositoryByOwnerAndName: (
    ownerId: string,
    name: string,
  ) => Promise<RepositoryLookupResult>;
  getRepositoryForAdministration: GetRepositoryForAdministrationUseCase["getRepositoryForAdministration"];
  listActivePublicRepositoriesForOrganizationOwner: (
    owner: { organizationId: string; login: string },
  ) => Promise<readonly PublicRepositorySummary[]>;
  listActivePublicRepositoriesForPersonalOwner: ListActivePublicRepositoriesForPersonalOwnerAdapter;
  listActiveRepositoriesForOwner: (
    ownerId: string,
  ) => Promise<readonly RepositoryCandidateReference[]>;
  renameRepository: RenameRepositoryUseCase["renameRepository"];
  restoreDeletedRepository: RestoreDeletedRepositoryUseCase["restoreDeletedRepository"];
  unarchiveRepository: UnarchiveRepositoryUseCase["unarchiveRepository"];
}

function mapCandidate(
  repository: RepositoryQuerySnapshot,
): RepositoryCandidateReference {
  return {
    repositoryId: repository.repositoryId,
    owner:
      repository.owner.kind === "personal"
        ? {
            kind: "personal",
            accountId: repository.owner.id,
            login: repository.owner.username,
          }
        : {
            kind: "organization",
            organizationId: repository.owner.id,
            login: repository.owner.username,
          },
    name: repository.name,
    description: repository.description,
    visibility: repository.visibility,
    lifecycleState: "active",
    updatedAt: repository.updatedAt,
  };
}

function composeRepositoriesServerFacade(): RepositoriesServerFacade {
  const repository = new InMemoryRepositoryQueryAdapter();
  const getByOwnerAndName = new GetRepositoryByOwnerAndNameHandler(repository);
  const listOrganizationPublic =
    new ListActivePublicRepositoriesForOrganizationOwnerHandler(repository);
  const listPersonalPublic =
    new ListActivePublicRepositoriesForPersonalOwnerHandler(repository);
  const listActiveForOwner =
    new ListActiveRepositoriesForOwnerHandler(repository);
  const managementService = new RepositoryManagementService(
    repository,
    new RepositoryOwnerAuthorizationAdapter(),
    new InMemoryRepositoryIdGeneratorAdapter(),
    new SystemRepositoryClockAdapter(),
  );
  const archive = new ArchiveRepositoryHandler(managementService);
  const changeVisibility =
    new ChangeRepositoryVisibilityHandler(managementService);
  const create = new CreateEmptyRepositoryHandler(managementService);
  const deleteManagedRepository =
    new DeleteRepositoryHandler(managementService);
  const getForAdministration =
    new GetRepositoryForAdministrationHandler(managementService);
  const rename = new RenameRepositoryHandler(managementService);
  const restore = new RestoreDeletedRepositoryHandler(managementService);
  const unarchive = new UnarchiveRepositoryHandler(managementService);

  return {
    archiveRepository: (command) =>
      archive.archiveRepository(command),
    changeRepositoryVisibility: (command) =>
      changeVisibility.changeRepositoryVisibility(command),
    createEmptyRepository: (command) =>
      create.createEmptyRepository(command),
    deleteRepository: (command) =>
      deleteManagedRepository.deleteRepository(command),
    getRepositoryByOwnerAndName: async (ownerId, name) => {
      const result = await getByOwnerAndName.getRepositoryByOwnerAndName({
        ownerId,
        name,
      });
      return result.status === "found"
        ? { status: "found", repository: mapCandidate(result.repository) }
        : result;
    },
    getRepositoryForAdministration: (query) =>
      getForAdministration.getRepositoryForAdministration(query),
    listActivePublicRepositoriesForOrganizationOwner: async (owner) => {
      const repositories =
        await listOrganizationPublic.listActivePublicRepositoriesForOrganizationOwner(
          { ownerOrganizationId: owner.organizationId },
        );
      return repositories.map((candidate) => ({
        repositoryId: candidate.repositoryId,
        ownerUsername: owner.login,
        name: candidate.name,
        description: candidate.description,
        visibility: "public",
        lifecycleState: "active",
        updatedAt: candidate.updatedAt,
      }));
    },
    listActivePublicRepositoriesForPersonalOwner:
      createListActivePublicRepositoriesForPersonalOwnerAdapter(
        listPersonalPublic,
      ),
    listActiveRepositoriesForOwner: async (ownerId) => {
      const repositories =
        await listActiveForOwner.listActiveRepositoriesForOwner({ ownerId });
      return repositories.map(mapCandidate);
    },
    renameRepository: (command) =>
      rename.renameRepository(command),
    restoreDeletedRepository: (command) =>
      restore.restoreDeletedRepository(command),
    unarchiveRepository: (command) =>
      unarchive.unarchiveRepository(command),
  };
}

export const repositoriesServerFacade =
  composeRepositoriesServerFacade();
