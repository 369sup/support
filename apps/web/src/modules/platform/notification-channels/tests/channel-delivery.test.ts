import { describe, expect, it } from "vitest";

import { InMemoryChannelDeliveryAdapter } from "../adapters/outbound/persistence/in-memory-channel-delivery.adapter";
import type { ChannelRuntimeGatewayPort } from "../application/ports/outbound/channel-runtime.gateway.port";
import type { EmailDeliveryGatewayPort } from "../application/ports/outbound/email-delivery.gateway.port";
import { ChannelDeliveryService } from "../application/services/channel-delivery.service";

class RuntimeFake implements ChannelRuntimeGatewayPort {
  now(): Date {
    return new Date("2026-07-28T00:00:00.000Z");
  }

  randomId(): string {
    return "channel-delivery-test";
  }
}

describe("channel delivery", () => {
  it("delivers email once for an idempotency key", async () => {
    let deliveryCount = 0;
    const gateway: EmailDeliveryGatewayPort = {
      deliver: () => {
        deliveryCount += 1;
        return Promise.resolve({
          status: "delivered",
          providerReference: "provider-message",
        });
      },
    };
    const service = new ChannelDeliveryService(
      new InMemoryChannelDeliveryAdapter(new Map()),
      gateway,
      new RuntimeFake(),
    );
    const command = {
      idempotencyKey: "notification-request-1",
      recipient: "user@example.com",
      subject: "Security notification",
      text: "A security setting changed.",
    };
    await expect(service.deliverEmail(command)).resolves.toMatchObject({
      status: "delivered",
      delivery: { state: "succeeded" },
    });
    await expect(service.deliverEmail(command)).resolves.toMatchObject({
      status: "already-processed",
    });
    expect(deliveryCount).toBe(1);
  });

  it("records a controlled provider failure", async () => {
    const gateway: EmailDeliveryGatewayPort = {
      deliver: () =>
        Promise.resolve({
          status: "provider-failed",
          failureCode: "smtp-delivery-failed",
        }),
    };
    const service = new ChannelDeliveryService(
      new InMemoryChannelDeliveryAdapter(new Map()),
      gateway,
      new RuntimeFake(),
    );
    await expect(
      service.deliverEmail({
        idempotencyKey: "notification-request-2",
        recipient: "user@example.com",
        subject: "Security notification",
        text: "A security setting changed.",
      }),
    ).resolves.toMatchObject({
      status: "delivery-failed",
      delivery: {
        failureCode: "smtp-delivery-failed",
        state: "failed",
      },
    });
  });
});
