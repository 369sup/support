import type {
  DeliverEmailCommand,
  DeliverEmailResult,
} from "../ports/inbound/deliver-email.use-case";
import type {
  GetChannelDeliveryQuery,
  GetChannelDeliveryResult,
} from "../ports/inbound/get-channel-delivery.use-case";
import type { ChannelDeliveryRepositoryPort } from "../ports/outbound/channel-delivery.repository.port";
import type { ChannelRuntimeGatewayPort } from "../ports/outbound/channel-runtime.gateway.port";
import type { EmailDeliveryGatewayPort } from "../ports/outbound/email-delivery.gateway.port";

function isValidEmailAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export class ChannelDeliveryService {
  private readonly repository: ChannelDeliveryRepositoryPort;
  private readonly emailGateway: EmailDeliveryGatewayPort;
  private readonly runtime: ChannelRuntimeGatewayPort;

  constructor(
    repository: ChannelDeliveryRepositoryPort,
    emailGateway: EmailDeliveryGatewayPort,
    runtime: ChannelRuntimeGatewayPort,
  ) {
    this.repository = repository;
    this.emailGateway = emailGateway;
    this.runtime = runtime;
  }

  async deliverEmail(
    command: DeliverEmailCommand,
  ): Promise<DeliverEmailResult> {
    if (
      command.idempotencyKey.trim() === "" ||
      !isValidEmailAddress(command.recipient) ||
      command.subject.trim() === "" ||
      command.text.trim() === ""
    ) {
      return { status: "invalid-request" };
    }
    const existing = await this.repository.findByIdempotencyKey(
      command.idempotencyKey,
    );
    if (existing !== null) {
      return { status: "already-processed", delivery: existing };
    }
    const now = this.runtime.now().toISOString();
    const accepted = {
      attemptCount: 1,
      channel: "email" as const,
      createdAt: now,
      deliveryId: this.runtime.randomId(),
      failureCode: null,
      idempotencyKey: command.idempotencyKey,
      providerReference: null,
      recipient: command.recipient,
      state: "accepted" as const,
      updatedAt: now,
    };
    await this.repository.save(accepted);
    const result = await this.emailGateway.deliver({
      html: command.html ?? null,
      recipient: command.recipient,
      subject: command.subject,
      text: command.text,
    });
    const completed =
      result.status === "delivered"
        ? {
            ...accepted,
            providerReference: result.providerReference,
            state: "succeeded" as const,
            updatedAt: this.runtime.now().toISOString(),
          }
        : {
            ...accepted,
            failureCode: result.failureCode,
            state: "failed" as const,
            updatedAt: this.runtime.now().toISOString(),
          };
    await this.repository.save(completed);
    return {
      status:
        completed.state === "succeeded"
          ? "delivered"
          : "delivery-failed",
      delivery: completed,
    };
  }

  async getChannelDelivery(
    query: GetChannelDeliveryQuery,
  ): Promise<GetChannelDeliveryResult> {
    if (query.deliveryId.trim() === "") {
      return { status: "invalid-query" };
    }
    const delivery = await this.repository.findById(query.deliveryId);
    return delivery === null
      ? { status: "delivery-not-found" }
      : { status: "found", delivery };
  }
}
