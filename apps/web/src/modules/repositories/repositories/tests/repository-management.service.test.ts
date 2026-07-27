import { describe, expect, it } from "vitest";

import type { EventRecorderPort } from "@/modules/platform/event-publication/integration-contracts";

import { InMemoryRepositoriesOutboxAdapter } from "../adapters/outbound/persistence/in-memory-repositories-outbox.adapter";
import { InMemoryRepositoryQueryAdapter } from "../adapters/outbound/persistence/in-memory-repository-query.adapter";
import type { RepositoryAdministrationAuthorizationGatewayPort } from "../application/ports/outbound/repository-administration-authorization.gateway.port";
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

class AdministrationGatewayFake
  implements RepositoryAdministrationAuthorizationGatewayPort
{
  private readonly isAllowed: boolean;

  constructor(isAllowed = true) {
    this.isAllowed = isAllowed;
  }

  hasRepositoryAdministration() {
    return Promise.resolve(this.isAllowed);
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
  administrationGateway = new AdministrationGatewayFake(),
  clock = new ClockFake(),
  eventRecorder,
  ownerGateway = new OwnerGatewayFake(),
}: Readonly<{
  administrationGateway?: RepositoryAdministrationAuthorizationGatewayPort;
  clock?: ClockFake;
  eventRecorder?: EventRecorderPort;
  ownerGateway?: OwnerGatewayGateway;
}> = {}) {
  return {
    clock,
    service: new RepositoryManagementService(
      new InMemoryRepositoryQueryAdapter([]),
      ownerGateway,
      administrationGateway,
      new IdGeneratorFake(),
      clock,
      eventRecorder,
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

  it("updates and clears the profile, then records only material changes", async () => {
    const outbox = new InMemoryRepositoriesOutboxAdapter(
      InMemoryRepositoriesOutboxAdapter.createState(),
      {
        nextEventId: () => "event_profile_updated",
        now: () => "2026-07-27T00:00:00.000Z",
      },
    );
    const { service } = createService({ eventRecorder: outbox });
    await service.createEmptyRepository({
      actorAccountId: "account_owner",
      ownerId: "account_owner",
      name: "support",
      description: "",
      visibility: "public",
    });

    await expect(
      service.updateRepositoryProfile({
        actorAccountId: "account_admin",
        ownerId: "account_owner",
        name: "support",
        description: " Product support. ",
        homepage: " https://support.example.com ",
      }),
    ).resolves.toMatchObject({
      status: "profile-updated",
      repository: {
        description: "Product support.",
        homepage: "https://support.example.com",
      },
    });
    await expect(
      service.updateRepositoryProfile({
        actorAccountId: "account_admin",
        ownerId: "account_owner",
        name: "support",
        description: "Product support.",
        homepage: "https://support.example.com",
      }),
    ).resolves.toMatchObject({ status: "profile-updated" });

    const events = await outbox.claimPending({
      claimedAt: "2026-07-27T00:00:01.000Z",
      limit: 10,
    });
    expect(events).toEqual([
      expect.objectContaining({
        eventId: "event_profile_updated",
        eventName: "RepositoryProfileUpdated",
        aggregateVersion: 2,
        orderingKey: "repository_1",
        payload: {
          description: "Product support.",
          homepage: "https://support.example.com",
          ownerId: "account_owner",
          repositoryId: "repository_1",
          updatedAt: "2026-07-27T00:00:00.000Z",
        },
      }),
    ]);

    await expect(
      service.updateRepositoryProfile({
        actorAccountId: "account_admin",
        ownerId: "account_owner",
        name: "support",
        description: "",
        homepage: "",
      }),
    ).resolves.toMatchObject({
      status: "profile-updated",
      repository: { description: "", homepage: "" },
    });
  });

  it("rejects invalid or archived profile updates", async () => {
    const { service } = createService();
    await service.createEmptyRepository({
      actorAccountId: "account_owner",
      ownerId: "account_owner",
      name: "support",
      description: "",
      visibility: "public",
    });

    await expect(
      service.updateRepositoryProfile({
        actorAccountId: "account_admin",
        ownerId: "account_owner",
        name: "support",
        description: "x".repeat(351),
        homepage: "",
      }),
    ).resolves.toEqual({ status: "invalid-description" });
    await expect(
      service.updateRepositoryProfile({
        actorAccountId: "account_admin",
        ownerId: "account_owner",
        name: "support",
        description: "",
        homepage: "javascript:alert(1)",
      }),
    ).resolves.toEqual({ status: "invalid-homepage" });
    await service.archiveRepository({
      actorAccountId: "account_owner",
      ownerId: "account_owner",
      name: "support",
      confirmation: "owner/support",
    });
    await expect(
      service.updateRepositoryProfile({
        actorAccountId: "account_admin",
        ownerId: "account_owner",
        name: "support",
        description: "Archived",
        homepage: "",
      }),
    ).resolves.toEqual({ status: "invalid-state" });
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

  it("requires effective repository admin permission for management", async () => {
    const { service } = createService({
      administrationGateway: new AdministrationGatewayFake(false),
    });
    await service.createEmptyRepository({
      actorAccountId: "account_owner",
      ownerId: "account_owner",
      name: "support",
      description: "",
      visibility: "public",
    });

    await expect(
      service.getRepositoryForAdministration({
        actorAccountId: "account_reader",
        ownerId: "account_owner",
        name: "support",
      }),
    ).resolves.toEqual({ status: "permission-denied" });
  });
});
