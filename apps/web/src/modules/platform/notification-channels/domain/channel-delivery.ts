export type ChannelDeliveryState =
  | "accepted"
  | "failed"
  | "succeeded";

export type ChannelDelivery = Readonly<{
  attemptCount: number;
  channel: "email";
  createdAt: string;
  deliveryId: string;
  failureCode: string | null;
  idempotencyKey: string;
  providerReference: string | null;
  recipient: string;
  state: ChannelDeliveryState;
  updatedAt: string;
}>;
