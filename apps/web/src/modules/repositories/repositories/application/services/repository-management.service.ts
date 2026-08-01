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
  UpdateRepositoryProfileCommand,
} from "../ports/inbound/repository-management.types";
import type { RenameRepositoryResult } from "../ports/inbound/rename-repository.use-case";
import type { RestoreDeletedRepositoryResult } from "../ports/inbound/restore-deleted-repository.use-case";
import type { UnarchiveRepositoryResult } from "../ports/inbound/unarchive-repository.use-case";
import type { UpdateRepositoryProfileResult } from "../ports/inbound/update-repository-profile.use-case";
import type { RepositoryAdministrationAuthorizationGatewayPort } from "../ports/outbound/repository-administration-authorization.gateway.port";
import type { RepositoryClockPort } from "../ports/outbound/repository-clock.port";
import type { RepositoryIdGeneratorPort } from "../ports/outbound/repository-id-generator.port";
import type { RepositoryOwnerAuthorizationGatewayPort } from "../ports/outbound/repository-owner-authorization.gateway.port";
import type {
  RepositoryQueryRepositoryPort,
  RepositoryQuerySnapshot,
} from "../ports/outbound/repository-query.repository.port";
import type { EventRecorderPort } from "@/modules/platform/event-publication/integration-contracts";

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
  private readonly administrationGateway: RepositoryAdministrationAuthorizationGatewayPort;
  private readonly idGenerator: RepositoryIdGeneratorPort;
  private readonly clock: RepositoryClockPort;
  private readonly eventRecorder: EventRecorderPort | undefined;

  constructor(
    repository: RepositoryQueryRepositoryPort,
    ownerGateway: RepositoryOwnerAuthorizationGatewayPort,
    administrationGateway: RepositoryAdministrationAuthorizationGatewayPort,
    idGenerator: RepositoryIdGeneratorPort,
    clock: RepositoryClockPort,
    eventRecorder?: EventRecorderPort,
  ) {
    this.repository = repository;
    this.ownerGateway = ownerGateway;
    this.administrationGateway = administrationGateway;
    this.idGenerator = idGenerator;
    this.clock = clock;
    this.eventRecorder = eventRecorder;
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
      homepage: "",
      visibility: command.visibility,
      lifecycleState: "active",
      version: 1,
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
    const repository = await this.repository.findByOwnerIdAndName(
      query.ownerId,
      query.name.trim(),
    );
    if (repository === null) {
      return { status: "repository-not-found" };
    }
    return (await this.administrationGateway.hasRepositoryAdministration({
      actorAccountId: query.actorAccountId,
      repository,
    }))
      ? { status: "found", repository }
      : { status: "permission-denied" };
  }

  async updateRepositoryProfile(
    command: UpdateRepositoryProfileCommand,
  ): Promise<UpdateRepositoryProfileResult> {
    const resolved = await this.getMutableRepository(command);
    if (resolved.status !== "found") {
      return resolved;
    }
    if (resolved.repository.lifecycleState !== "active") {
      return { status: "invalid-state" };
    }

    const description = command.description.trim();
    if (description.length > maximumDescriptionLength) {
      return { status: "invalid-description" };
    }
    const homepage = this.normalizeHomepage(command.homepage);
    if (homepage === null) {
      return { status: "invalid-homepage" };
    }
    if (
      description === resolved.repository.description &&
      homepage === resolved.repository.homepage
    ) {
      return {
        status: "profile-updated",
        repository: resolved.repository,
      };
    }

    const updated = this.touch(resolved.repository, {
      description,
      homepage,
    });
    await this.repository.save(updated);
    await this.eventRecorder?.record({
      aggregateId: updated.repositoryId,
      aggregateVersion: updated.version,
      eventName: "RepositoryProfileUpdated",
      eventVersion: 1,
      orderingKey: updated.repositoryId,
      payload: {
        description: updated.description,
        homepage: updated.homepage,
        ownerId: updated.owner.id,
        repositoryId: updated.repositoryId,
        updatedAt: updated.updatedAt,
      },
    });
    return { status: "profile-updated", repository: updated };
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
      version: resolved.repository.version + 1,
      updatedAt: now.toISOString(),
      deletedAt: now.toISOString(),
      restoreUntil: new Date(
        now.getTime() + restoreWindowMilliseconds,
      ).toISOString(),
    };
    await this.repository.save(deleted);
    await this.eventRecorder?.record({
      aggregateId: deleted.repositoryId,
      aggregateVersion: deleted.version,
      eventName: "RepositoryDeleted",
      eventVersion: 1,
      orderingKey: deleted.repositoryId,
      payload: {
        deletedAt: deleted.deletedAt,
        ownerId: deleted.owner.id,
        repositoryId: deleted.repositoryId,
        restoreUntil: deleted.restoreUntil,
      },
    });
    return { status: "deleted", repository: deleted };
  }

  async restoreDeletedRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<RestoreDeletedRepositoryResult> {
    const resolved = await this.getOwnerConfirmedRepository(command);
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
      version: 1,
      updatedAt: now.toISOString(),
      deletedAt: null,
      restoreUntil: null,
    };
    const restoreResult = await this.repository.restoreDeleted(
      resolved.repository.repositoryId,
      restored,
    );
    if (restoreResult === "tombstone-not-found") {
      return { status: "repository-not-found" };
    }
    await this.eventRecorder?.record({
      aggregateId: restored.repositoryId,
      aggregateVersion: restored.version,
      eventName: "RepositoryRestored",
      eventVersion: 1,
      orderingKey: restored.repositoryId,
      payload: {
        previousRepositoryId: resolved.repository.repositoryId,
        repositoryId: restored.repositoryId,
        restoredAt: restored.updatedAt,
      },
    });
    return { status: "restored", repository: restored };
  }

  private async getOwnerConfirmedRepository(
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
    const repository = await this.repository.findByOwnerIdAndName(
      command.ownerId,
      command.name.trim(),
    );
    if (repository === null) {
      return { status: "repository-not-found" };
    }
    const owner = await this.ownerGateway.authorizeOwner(
      command.actorAccountId,
      repository.owner.id,
    );
    if (owner === null) {
      return { status: "permission-denied" };
    }
    const expected = `${repository.owner.username}/${repository.name}`;
    return command.confirmation.trim() === expected
      ? { status: "found", repository }
      : { status: "confirmation-mismatch" };
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
    await this.eventRecorder?.record({
      aggregateId: changed.repositoryId,
      aggregateVersion: changed.version,
      eventName:
        status === "archived"
          ? "RepositoryArchived"
          : "RepositoryUnarchived",
      eventVersion: 1,
      orderingKey: changed.repositoryId,
      payload: {
        lifecycleState: changed.lifecycleState,
        repositoryId: changed.repositoryId,
        updatedAt: changed.updatedAt,
      },
    });
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

  private normalizeHomepage(value: string): string | null {
    const homepage = value.trim();
    if (homepage === "") {
      return "";
    }
    try {
      const parsed = new URL(homepage);
      return parsed.protocol === "http:" || parsed.protocol === "https:"
        ? homepage
        : null;
    } catch {
      return null;
    }
  }

  private touch(
    repository: RepositoryQuerySnapshot,
    updates: Partial<RepositoryQuerySnapshot>,
  ): RepositoryQuerySnapshot {
    return {
      ...repository,
      ...updates,
      version: repository.version + 1,
      updatedAt: this.clock.now().toISOString(),
    };
  }
}
