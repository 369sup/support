import {
  createListActivePublicRepositoriesForPersonalOwnerAdapter,
  type ListActivePublicRepositoriesForPersonalOwnerAdapter,
} from "../adapters/inbound/server/list-active-public-repositories-for-personal-owner.adapter";
import { InMemoryRepositoryQueryAdapter } from "../adapters/outbound/persistence/in-memory-repository-query.adapter";
import { GetRepositoryByOwnerAndNameHandler } from "../application/queries/get-repository-by-owner-and-name.handler";
import { ListActivePublicRepositoriesForOrganizationOwnerHandler } from "../application/queries/list-active-public-repositories-for-organization-owner.handler";
import { ListActivePublicRepositoriesForPersonalOwnerHandler } from "../application/queries/list-active-public-repositories-for-personal-owner.handler";
import { ListActiveRepositoriesForOwnerHandler } from "../application/queries/list-active-repositories-for-owner.handler";
import type { RepositoryQuerySnapshot } from "../application/ports/outbound/repository-query.repository.port";
import type {
  RepositoryCandidateReference,
  RepositoryLookupResult,
} from "../contracts/repository-reference";
import type { PublicRepositorySummary } from "../contracts/repository-summary";

export interface RepositoriesServerFacade {
  getRepositoryByOwnerAndName: (
    ownerId: string,
    name: string,
  ) => Promise<RepositoryLookupResult>;
  listActivePublicRepositoriesForOrganizationOwner: (
    owner: { organizationId: string; login: string },
  ) => Promise<readonly PublicRepositorySummary[]>;
  listActivePublicRepositoriesForPersonalOwner: ListActivePublicRepositoriesForPersonalOwnerAdapter;
  listActiveRepositoriesForOwner: (
    ownerId: string,
  ) => Promise<readonly RepositoryCandidateReference[]>;
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

  return {
    getRepositoryByOwnerAndName: async (ownerId, name) => {
      const result = await getByOwnerAndName.getRepositoryByOwnerAndName({
        ownerId,
        name,
      });
      return result.status === "found"
        ? { status: "found", repository: mapCandidate(result.repository) }
        : result;
    },
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
  };
}

export const repositoriesServerFacade =
  composeRepositoriesServerFacade();
