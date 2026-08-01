import { describe, expect, it } from "vitest";

import { InMemoryContextOutboxAdapter } from "../adapters/outbound/persistence/in-memory-context-outbox.adapter";
import { InMemoryEventSourceRegistryAdapter } from "../adapters/outbound/persistence/in-memory-event-source-registry.adapter";
import { InMemoryPublicationStateAdapter } from "../adapters/outbound/persistence/in-memory-publication-state.adapter";
import { PublishPendingEventsHandler } from "../application/commands/publish-pending-events.handler";
import { RedeliverDeadLetterHandler } from "../application/commands/redeliver-dead-letter.handler";
import type { PublicationClockPort } from "../application/ports/outbound/publication-clock.port";
import type {
  PublicationDeliveryPort,
  PublicationDeliveryResult,
} from "../application/ports/outbound/publication-delivery.port";
import type { PublicationIdGeneratorPort } from "../application/ports/outbound/publication-id-generator.port";
import { GetPublicationMetricsHandler } from "../application/queries/get-publication-metrics.handler";
import { ListDeadLettersHandler } from "../application/queries/list-dead-letters.handler";

class DeterministicClock implements PublicationClockPort {
  private tick = 0;

  now() {
    this.tick += 1;
    return new Date(Date.UTC(2026, 6, 23, 0, 0, this.tick)).toISOString();
  }
}

class DeterministicIdGenerator implements PublicationIdGeneratorPort {
  private value = 0;

  private next(prefix: string) {
    this.value += 1;
    return `${prefix}_${this.value}`;
  }

  nextAttemptId() {
    return this.next("attempt");
  }

  nextDeadLetterId() {
    return this.next("dead_letter");
  }

  nextEventId() {
    return this.next("event");
  }
}

class ConfigurableDelivery implements PublicationDeliveryPort {
  calls = 0;
  result: PublicationDeliveryResult = {
    status: "failed",
    errorCode: "simulated-unavailable",
  };

  deliver() {
    this.calls += 1;
    return Promise.resolve(this.result);
  }
}

function createFixture() {
  const clock = new DeterministicClock();
  const idGenerator = new DeterministicIdGenerator();
  const delivery = new ConfigurableDelivery();
  const registry = new InMemoryEventSourceRegistryAdapter(new Map());
  const state = new InMemoryPublicationStateAdapter(
    InMemoryPublicationStateAdapter.createState(),
  );
  const outbox = new InMemoryContextOutboxAdapter(
    "organizations/organization-roles",
    idGenerator,
    clock,
    InMemoryContextOutboxAdapter.createState(),
  );
  registry.register(outbox);
  return {
    clock,
    delivery,
    idGenerator,
    metrics: new GetPublicationMetricsHandler(state, registry, clock),
    outbox,
    publish: new PublishPendingEventsHandler(
      registry,
      state,
      delivery,
      clock,
      idGenerator,
    ),
    queryDeadLetters: new ListDeadLettersHandler(state),
    redeliver: new RedeliverDeadLetterHandler(
      state,
      delivery,
      clock,
      idGenerator,
    ),
    state,
  };
}

describe("event publication", () => {
  it("retries committed events and dead-letters the third failure", async () => {
    const fixture = createFixture();
    await fixture.outbox.record({
      aggregateId: "organization_role_assignment_1",
      aggregateVersion: 1,
      eventName: "OrganizationRoleAssigned",
      eventVersion: 1,
      orderingKey: "organization_role_assignment_1",
      payload: { privateValue: "never-returned-by-inspector" },
    });

    await expect(
      fixture.publish.publishPendingEvents({}),
    ).resolves.toMatchObject({ status: "published", retried: 1 });
    await fixture.publish.publishPendingEvents({});
    await expect(
      fixture.publish.publishPendingEvents({}),
    ).resolves.toMatchObject({ status: "published", deadLettered: 1 });

    const result = await fixture.queryDeadLetters.listDeadLetters({});
    expect(result.deadLetters).toHaveLength(1);
    expect(result.deadLetters[0]).not.toHaveProperty("envelope");
    expect(result.deadLetters[0]).not.toHaveProperty("payload");
    await expect(fixture.metrics.getPublicationMetrics()).resolves.toMatchObject({
      metrics: {
        attempts: 3,
        deadLetters: 1,
        failedAttempts: 3,
      },
    });
  });

  it("redelivers a dead letter and records an idempotency receipt", async () => {
    const fixture = createFixture();
    await fixture.outbox.record({
      aggregateId: "team_1",
      aggregateVersion: 1,
      eventName: "OrganizationTeamCreated",
      eventVersion: 1,
      orderingKey: "team_1",
      payload: {},
    });
    await fixture.publish.publishPendingEvents({});
    await fixture.publish.publishPendingEvents({});
    await fixture.publish.publishPendingEvents({});
    const deadLetter = (
      await fixture.queryDeadLetters.listDeadLetters({})
    ).deadLetters[0];
    expect(deadLetter).toBeDefined();

    fixture.delivery.result = { status: "delivered" };
    await expect(
      fixture.redeliver.redeliverDeadLetter({
        deadLetterId: deadLetter?.deadLetterId ?? "",
      }),
    ).resolves.toMatchObject({ status: "delivered" });
    await expect(
      fixture.queryDeadLetters.listDeadLetters({}),
    ).resolves.toMatchObject({ deadLetters: [] });
    await expect(fixture.metrics.getPublicationMetrics()).resolves.toMatchObject({
      metrics: { receipts: 1 },
    });
  });

  it("acknowledges an already-received event without duplicate delivery", async () => {
    const fixture = createFixture();
    const envelope = await fixture.outbox.record({
      aggregateId: "grant_1",
      aggregateVersion: 1,
      eventName: "TeamRepositoryAccessGranted",
      eventVersion: 1,
      orderingKey: "grant_1",
      payload: {},
    });
    await fixture.state.saveReceipt({
      deliveredAt: fixture.clock.now(),
      eventId: envelope.eventId,
      version: 1,
    });

    await expect(
      fixture.publish.publishPendingEvents({}),
    ).resolves.toMatchObject({
      status: "published",
      duplicates: 1,
      delivered: 0,
    });
    expect(fixture.delivery.calls).toBe(0);
  });
});
