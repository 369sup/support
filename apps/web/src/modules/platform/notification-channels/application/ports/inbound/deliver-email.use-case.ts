import type { ChannelDelivery } from "../../../domain/channel-delivery";

export type DeliverEmailCommand = Readonly<{
  html?: string;
  idempotencyKey: string;
  recipient: string;
  subject: string;
  text: string;
}>;

export type DeliverEmailResult =
  | Readonly<{
      status: "delivered" | "delivery-failed" | "already-processed";
      delivery: ChannelDelivery;
    }>
  | Readonly<{
      status: "invalid-request";
    }>;

export interface DeliverEmailUseCase {
  deliverEmail(
    command: DeliverEmailCommand,
  ): Promise<DeliverEmailResult>;
}
