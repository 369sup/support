import type { ArchiveRepositoryResult } from "../ports/inbound/archive-repository.use-case";
import type { ChangeRepositoryVisibilityResult } from "../ports/inbound/change-repository-visibility.use-case";
import type { CreateEmptyRepositoryResult } from "../ports/inbound/create-empty-repository.use-case";
import type { DeleteRepositoryResult } from "../ports/inbound/delete-repository.use-case";
import type { GetRepositoryForAdministrationResult } from "../ports/inbound/get-repository-for-administration.use-case";
import type {
  ChangeRepositoryVisibilityCommand,
  ConfirmRepositoryLifecycleCommand,
  CreateEmptyRepositoryCommand,
  GetRepositoryForAdministrationQuery,
  RenameRepositoryCommand,
} from "../ports/inbound/repository-management.types";
import type { RenameRepositoryResult } from "../ports/inbound/rename-repository.use-case";
import type { RestoreDeletedRepositoryResult } from "../ports/inbound/restore-deleted-repository.use-case";
import type { UnarchiveRepositoryResult } from "../ports/inbound/unarchive-repository.use-case";
import type { RepositoryClockPort } from "../ports/outbound/repository-clock.port";
import type { RepositoryIdGeneratorPort } from "../ports/outbound/repository-id-generator.port";
import type { RepositoryOwnerAuthorizationGatewayPort } from "../ports/outbound/repository-owner-authorization.gateway.port";
import type {
  RepositoryQueryRepositoryPort,
  RepositoryQuerySnapshot,
} from "../ports/outbound/repository-query.repository.port";

const maximumDescriptionLength = 350;
const repositoryNamePattern = /^[A-Za-z0-9._-]{1,100}$/;
const restoreWindowMilliseconds = 90 * 24 * 60 * 60 * 1_000;

type LifecycleChangeResult<T extends "archived" | "unarchived"> =
  | Readonly<{ status: T; repository: RepositoryQuerySnapshot }>
  | Readonly<{
      status:
        | "confirmation-mismatch"
        | "invalid-state"
        | "permission-denied"
        | "repository-not-found";
    }>;

export class RepositoryManagementService {
  private readonly repository: RepositoryQueryRepositoryPort;
  private readonly ownerGateway: RepositoryOwnerAuthorizationGatewayPort;
  private readonly idGenerator: RepositoryIdGeneratorPort;
  private readonly clock: RepositoryClockPort;

  constructor(
    repository: RepositoryQueryRepositoryPort,
    ownerGateway: RepositoryOwnerAuthorizationGatewayPort,
    idGenerator: RepositoryIdGeneratorPort,
    clock: RepositoryClockPort,
  ) {
    this.repository = repository;
    this.ownerGateway = ownerGateway;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async createEmptyRepository(
    command: CreateEmptyRepositoryCommand,
  ): Promise<CreateEmptyRepositoryResult> {
    const owner = await this.ownerGateway.authorizeOwner(
      command.actorAccountId,
      command.ownerId,
    );
    if (owner === null) {
      return { status: "permission-denied" };
    }
    const name = this.normalizeName(command.name);
    if (name === null) {
      return { status: "invalid-name" };
    }
    const description = command.description.trim();
    if (description.length > maximumDescriptionLength) {
      return { status: "invalid-description" };
    }
    if (command.visibility !== "public" && command.visibility !== "private") {
      return {
        status:
          command.visibility === "internal"
            ? "internal-visibility-not-available"
            : "invalid-visibility",
      };
    }
    if (
      (await this.repository.findByOwnerIdAndName(owner.id, name)) !== null
    ) {
      return { status: "repository-name-conflict" };
    }

    const now = this.clock.now().toISOString();
    const created: RepositoryQuerySnapshot = {
      repositoryId: this.idGenerator.nextRepositoryId(),
      owner: {
        kind: owner.kind,
        id: owner.id,
        username: owner.login,
      },
      name,
      description,
      visibility: command.visibility,
      lifecycleState: "active",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      restoreUntil: null,
    };
    await this.repository.save(created);
    return { status: "created", repository: created };
  }

  async getRepositoryForAdministration(
    query: GetRepositoryForAdministrationQuery,
  ): Promise<GetRepositoryForAdministrationResult> {
    const owner = await this.ownerGateway.authorizeOwner(
      query.actorAccountId,
      query.ownerId,
    );
    if (owner === null) {
      return { status: "permission-denied" };
    }
    const repository = await this.repository.findByOwnerIdAndName(
      owner.id,
      query.name.trim(),
    );
    return repository === null
      ? { status: "repository-not-found" }
      : { status: "found", repository };
  }

  async renameRepository(
    command: RenameRepositoryCommand,
  ): Promise<RenameRepositoryResult> {
    const resolved = await this.getMutableRepository(command);
    if (resolved.status !== "found") {
      return resolved;
    }
    if (resolved.repository.lifecycleState !== "active") {
      return { status: "invalid-state" };
    }
    const newName = this.normalizeName(command.newName);
    if (newName === null) {
      return { status: "invalid-name" };
    }
    const conflict = await this.repository.findByOwnerIdAndName(
      resolved.repository.owner.id,
      newName,
    );
    if (
      conflict !== null &&
      conflict.repositoryId !== resolved.repository.repositoryId
    ) {
      return { status: "repository-name-conflict" };
    }
    const renamed = this.touch(resolved.repository, {
      name: newName,
    });
    await this.repository.save(renamed);
    return { status: "renamed", repository: renamed };
  }

  async changeRepositoryVisibility(
    command: ChangeRepositoryVisibilityCommand,
  ): Promise<ChangeRepositoryVisibilityResult> {
    const resolved = await this.getMutableRepository(command);
    if (resolved.status !== "found") {
      return resolved;
    }
    if (resolved.repository.lifecycleState !== "active") {
      return { status: "invalid-state" };
    }
    if (
      command.visibility !== "public" &&
      command.visibility !== "private" &&
      command.visibility !== "internal"
    ) {
      return { status: "invalid-visibility" };
    }
    if (
      command.visibility === "internal" &&
      resolved.repository.visibility !== "internal"
    ) {
      return { status: "internal-visibility-not-available" };
    }
    const changed = this.touch(resolved.repository, {
      visibility: command.visibility,
    });
    await this.repository.save(changed);
    return { status: "visibility-changed", repository: changed };
  }

  async archiveRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<ArchiveRepositoryResult> {
    return this.changeLifecycle(command, "active", "archived", "archived");
  }

  async unarchiveRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<UnarchiveRepositoryResult> {
    return this.changeLifecycle(command, "archived", "active", "unarchived");
  }

  async deleteRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<DeleteRepositoryResult> {
    const resolved = await this.getConfirmedRepository(command);
    if (resolved.status !== "found") {
      return resolved;
    }
    if (resolved.repository.lifecycleState === "deleted") {
      return { status: "invalid-state" };
    }
    const now = this.clock.now();
    const deleted: RepositoryQuerySnapshot = {
      ...resolved.repository,
      lifecycleState: "deleted",
      updatedAt: now.toISOString(),
      deletedAt: now.toISOString(),
      restoreUntil: new Date(
        now.getTime() + restoreWindowMilliseconds,
      ).toISOString(),
    };
    await this.repository.save(deleted);
    return { status: "deleted", repository: deleted };
  }

  async restoreDeletedRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<RestoreDeletedRepositoryResult> {
    const resolved = await this.getConfirmedRepository(command);
    if (resolved.status !== "found") {
      return resolved;
    }
    if (resolved.repository.lifecycleState !== "deleted") {
      return { status: "invalid-state" };
    }
    const now = this.clock.now();
    if (
      resolved.repository.restoreUntil === null ||
      now.getTime() > Date.parse(resolved.repository.restoreUntil)
    ) {
      return { status: "restore-window-expired" };
    }
    const restored: RepositoryQuerySnapshot = {
      ...resolved.repository,
      repositoryId: this.idGenerator.nextRepositoryId(),
      lifecycleState: "active",
      updatedAt: now.toISOString(),
      deletedAt: null,
      restoreUntil: null,
    };
    await this.repository.save(restored);
    return { status: "restored", repository: restored };
  }

  private async changeLifecycle<T extends "archived" | "unarchived">(
    command: ConfirmRepositoryLifecycleCommand,
    from: RepositoryQuerySnapshot["lifecycleState"],
    to: RepositoryQuerySnapshot["lifecycleState"],
    status: T,
  ): Promise<LifecycleChangeResult<T>> {
    const resolved = await this.getConfirmedRepository(command);
    if (resolved.status !== "found") {
      return resolved;
    }
    if (resolved.repository.lifecycleState !== from) {
      return { status: "invalid-state" };
    }
    const changed = this.touch(resolved.repository, {
      lifecycleState: to,
    });
    await this.repository.save(changed);
    return { status, repository: changed };
  }

  private async getConfirmedRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<
    | Readonly<{ status: "found"; repository: RepositoryQuerySnapshot }>
    | Readonly<{
        status:
          | "confirmation-mismatch"
          | "permission-denied"
          | "repository-not-found";
      }>
  > {
    const resolved = await this.getMutableRepository(command);
    if (resolved.status !== "found") {
      return resolved;
    }
    const expected = `${resolved.repository.owner.username}/${resolved.repository.name}`;
    return command.confirmation.trim() === expected
      ? resolved
      : { status: "confirmation-mismatch" };
  }

  private getMutableRepository(
    input: GetRepositoryForAdministrationQuery,
  ): Promise<GetRepositoryForAdministrationResult> {
    return this.getRepositoryForAdministration(input);
  }

  private normalizeName(value: string): string | null {
    const name = value.trim();
    return repositoryNamePattern.test(name) && name !== "." && name !== ".."
      ? name
      : null;
  }

  private touch(
    repository: RepositoryQuerySnapshot,
    updates: Partial<RepositoryQuerySnapshot>,
  ): RepositoryQuerySnapshot {
    return {
      ...repository,
      ...updates,
      updatedAt: this.clock.now().toISOString(),
    };
  }
}
