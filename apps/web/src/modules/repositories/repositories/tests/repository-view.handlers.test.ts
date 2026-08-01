import { describe, expect, it } from "vitest";

import { InMemoryRepositoryQueryAdapter } from "../adapters/outbound/persistence/in-memory-repository-query.adapter";
import type { RepositoryOwnerAuthorizationGatewayPort } from "../application/ports/outbound/repository-owner-authorization.gateway.port";
import type { RepositoryViewAuthorizationGatewayPort } from "../application/ports/outbound/repository-view-authorization.gateway.port";
import type { RepositoryQuerySnapshot } from "../application/ports/outbound/repository-query.repository.port";
import { GetRepositoryForViewingHandler } from "../application/queries/get-repository-for-viewing.handler";
import { ListDeletedRepositoriesForRestorationHandler } from "../application/queries/list-deleted-repositories-for-restoration.handler";
import { ListVisibleRepositoriesForOwnerHandler } from "../application/queries/list-visible-repositories-for-owner.handler";

const repositories = [
  createRepository("active", "active", null, null),
  createRepository("archived", "archived", null, null),
  createRepository(
    "deleted",
    "deleted",
    "2026-07-01T00:00:00.000Z",
    "2026-09-29T00:00:00.000Z",
  ),
  createRepository(
    "expired",
    "deleted",
    "2026-01-01T00:00:00.000Z",
    "2026-04-01T00:00:00.000Z",
  ),
] as const;

const allowedViewGateway: RepositoryViewAuthorizationGatewayPort = {
  resolveRepositoryPermission: () => Promise.resolve("admin"),
};

const ownerGateway: RepositoryOwnerAuthorizationGatewayPort = {
  authorizeOwner: () =>
    Promise.resolve({
      kind: "personal",
      id: "account_owner",
      login: "owner",
    }),
};

describe("repository view handlers", () => {
  it("lists visible active and archived repositories but never tombstones", async () => {
    const handler = new ListVisibleRepositoriesForOwnerHandler(
      new InMemoryRepositoryQueryAdapter(repositories),
      allowedViewGateway,
    );

    await expect(
      handler.listVisibleRepositoriesForOwner({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
      }),
    ).resolves.toMatchObject([
      { name: "active", lifecycleState: "active" },
      { name: "archived", lifecycleState: "archived" },
    ]);
  });

  it("normalizes denied and absent lookups to repository-not-found", async () => {
    const repository = new InMemoryRepositoryQueryAdapter(repositories);
    const denied = new GetRepositoryForViewingHandler(repository, {
      resolveRepositoryPermission: () => Promise.resolve(null),
    });
    const allowed = new GetRepositoryForViewingHandler(
      repository,
      allowedViewGateway,
    );

    await expect(
      denied.getRepositoryForViewing({
        actorAccountId: "account_outsider",
        ownerId: "account_owner",
        name: "active",
      }),
    ).resolves.toEqual({ status: "repository-not-found" });
    await expect(
      allowed.getRepositoryForViewing({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
        name: "missing",
      }),
    ).resolves.toEqual({ status: "repository-not-found" });
  });

  it("lists owner-only tombstones with restore deadline eligibility", async () => {
    const handler = new ListDeletedRepositoriesForRestorationHandler(
      new InMemoryRepositoryQueryAdapter(repositories),
      ownerGateway,
      { now: () => new Date("2026-07-30T00:00:00.000Z") },
    );

    await expect(
      handler.listDeletedRepositoriesForRestoration({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
      }),
    ).resolves.toMatchObject({
      status: "found",
      repositories: [
        { name: "deleted", isRestorable: true },
        { name: "expired", isRestorable: false },
      ],
    });
  });

  it("denies deleted-repository discovery to a non-owner", async () => {
    const handler = new ListDeletedRepositoriesForRestorationHandler(
      new InMemoryRepositoryQueryAdapter(repositories),
      { authorizeOwner: () => Promise.resolve(null) },
      { now: () => new Date("2026-07-30T00:00:00.000Z") },
    );

    await expect(
      handler.listDeletedRepositoriesForRestoration({
        actorAccountId: "account_outsider",
        ownerId: "account_owner",
      }),
    ).resolves.toEqual({ status: "permission-denied" });
  });
});

function createRepository(
  name: string,
  lifecycleState: RepositoryQuerySnapshot["lifecycleState"],
  deletedAt: string | null,
  restoreUntil: string | null,
): RepositoryQuerySnapshot {
  return {
    repositoryId: `repository_${name}`,
    owner: {
      kind: "personal",
      id: "account_owner",
      username: "owner",
    },
    name,
    description: `${name} repository`,
    homepage: "",
    visibility: "private",
    lifecycleState,
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    deletedAt,
    restoreUntil,
  };
}
