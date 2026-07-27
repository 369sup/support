import { describe, expect, it } from "vitest";

import { InMemoryRepositoryQueryAdapter } from "../adapters/outbound/persistence/in-memory-repository-query.adapter";
import type { RepositoryClockPort } from "../application/ports/outbound/repository-clock.port";
import type { RepositoryIdGeneratorPort } from "../application/ports/outbound/repository-id-generator.port";
import type {
  AuthorizedRepositoryOwner,
  RepositoryOwnerAuthorizationGatewayPort,
} from "../application/ports/outbound/repository-owner-authorization.gateway.port";
import { RepositoryManagementService } from "../application/services/repository-management.service";

class OwnerGatewayFake implements RepositoryOwnerAuthorizationGatewayPort {
  private readonly owner: AuthorizedRepositoryOwner | null;

  constructor(owner: AuthorizedRepositoryOwner | null = {
      kind: "personal",
      id: "account_owner",
      login: "owner",
  }) {
    this.owner = owner;
  }

  authorizeOwner() {
    return Promise.resolve(this.owner);
  }
}

class IdGeneratorFake implements RepositoryIdGeneratorPort {
  private sequence = 0;

  nextRepositoryId() {
    this.sequence += 1;
    return `repository_${this.sequence}`;
  }
}

class ClockFake implements RepositoryClockPort {
  private current: Date;

  constructor(current = new Date("2026-07-27T00:00:00.000Z")) {
    this.current = current;
  }

  now() {
    return new Date(this.current);
  }

  advance(milliseconds: number) {
    this.current = new Date(this.current.getTime() + milliseconds);
  }
}

function createService({
  clock = new ClockFake(),
  ownerGateway = new OwnerGatewayFake(),
}: Readonly<{
  clock?: ClockFake;
  ownerGateway?: OwnerGatewayGateway;
}> = {}) {
  return {
    clock,
    service: new RepositoryManagementService(
      new InMemoryRepositoryQueryAdapter([]),
      ownerGateway,
      new IdGeneratorFake(),
      clock,
    ),
  };
}

type OwnerGatewayGateway = RepositoryOwnerAuthorizationGatewayPort;

describe("RepositoryManagementService", () => {
  it("creates an empty repository and enforces owner and name rules", async () => {
    const { service } = createService();

    const created = await service.createEmptyRepository({
      actorAccountId: "account_owner",
      ownerId: "account_owner",
      name: "support",
      description: " Product support. ",
      visibility: "private",
    });
    expect(created).toMatchObject({
      status: "created",
      repository: {
        repositoryId: "repository_1",
        name: "support",
        description: "Product support.",
        visibility: "private",
        lifecycleState: "active",
      },
    });
    await expect(
      service.createEmptyRepository({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
        name: "SUPPORT",
        description: "",
        visibility: "public",
      }),
    ).resolves.toEqual({ status: "repository-name-conflict" });
    await expect(
      service.createEmptyRepository({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
        name: "invalid name",
        description: "",
        visibility: "public",
      }),
    ).resolves.toEqual({ status: "invalid-name" });
  });

  it("renames and changes visibility only while active", async () => {
    const { service } = createService();
    await service.createEmptyRepository({
      actorAccountId: "account_owner",
      ownerId: "account_owner",
      name: "support",
      description: "",
      visibility: "public",
    });

    await expect(
      service.renameRepository({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
        name: "support",
        newName: "helpdesk",
      }),
    ).resolves.toMatchObject({
      status: "renamed",
      repository: { name: "helpdesk" },
    });
    await expect(
      service.changeRepositoryVisibility({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
        name: "helpdesk",
        visibility: "private",
      }),
    ).resolves.toMatchObject({
      status: "visibility-changed",
      repository: { visibility: "private" },
    });
    await expect(
      service.changeRepositoryVisibility({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
        name: "helpdesk",
        visibility: "internal",
      }),
    ).resolves.toEqual({
      status: "internal-visibility-not-available",
    });
  });

  it("archives, unarchives, deletes, and restores within ninety days", async () => {
    const { clock, service } = createService();
    const created = await service.createEmptyRepository({
      actorAccountId: "account_owner",
      ownerId: "account_owner",
      name: "support",
      description: "",
      visibility: "public",
    });
    if (created.status !== "created") {
      throw new Error("Expected repository creation.");
    }

    await expect(
      service.archiveRepository({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
        name: "support",
        confirmation: "owner/support",
      }),
    ).resolves.toMatchObject({
      status: "archived",
      repository: { lifecycleState: "archived" },
    });
    await expect(
      service.unarchiveRepository({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
        name: "support",
        confirmation: "owner/support",
      }),
    ).resolves.toMatchObject({
      status: "unarchived",
      repository: { lifecycleState: "active" },
    });
    await expect(
      service.deleteRepository({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
        name: "support",
        confirmation: "owner/support",
      }),
    ).resolves.toMatchObject({
      status: "deleted",
      repository: {
        lifecycleState: "deleted",
        restoreUntil: "2026-10-25T00:00:00.000Z",
      },
    });
    const restored = await service.restoreDeletedRepository({
      actorAccountId: "account_owner",
      ownerId: "account_owner",
      name: "support",
      confirmation: "owner/support",
    });
    expect(restored).toMatchObject({
      status: "restored",
      repository: {
        repositoryId: "repository_2",
        lifecycleState: "active",
      },
    });
    expect(
      restored.status === "restored"
        ? restored.repository.repositoryId
        : null,
    ).not.toBe(created.repository.repositoryId);

    clock.advance(1);
  });

  it("rejects a restore after the ninety-day window", async () => {
    const { clock, service } = createService();
    await service.createEmptyRepository({
      actorAccountId: "account_owner",
      ownerId: "account_owner",
      name: "support",
      description: "",
      visibility: "public",
    });
    await service.deleteRepository({
      actorAccountId: "account_owner",
      ownerId: "account_owner",
      name: "support",
      confirmation: "owner/support",
    });
    clock.advance(90 * 24 * 60 * 60 * 1_000 + 1);

    await expect(
      service.restoreDeletedRepository({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
        name: "support",
        confirmation: "owner/support",
      }),
    ).resolves.toEqual({ status: "restore-window-expired" });
  });

  it("rejects unauthorized owners and destructive confirmation mismatches", async () => {
    const denied = createService({
      ownerGateway: new OwnerGatewayFake(null),
    });
    await expect(
      denied.service.createEmptyRepository({
        actorAccountId: "account_outsider",
        ownerId: "account_owner",
        name: "support",
        description: "",
        visibility: "public",
      }),
    ).resolves.toEqual({ status: "permission-denied" });

    const { service } = createService();
    await service.createEmptyRepository({
      actorAccountId: "account_owner",
      ownerId: "account_owner",
      name: "support",
      description: "",
      visibility: "public",
    });
    await expect(
      service.deleteRepository({
        actorAccountId: "account_owner",
        ownerId: "account_owner",
        name: "support",
        confirmation: "support",
      }),
    ).resolves.toEqual({ status: "confirmation-mismatch" });
  });
});
