import type { ChannelDelivery } from "../../../domain/channel-delivery";

export type GetChannelDeliveryQuery = Readonly<{
  deliveryId: string;
}>;

export type GetChannelDeliveryResult =
  | Readonly<{ status: "found"; delivery: ChannelDelivery }>
  | Readonly<{ status: "delivery-not-found" | "invalid-query" }>;

export interface GetChannelDeliveryUseCase {
  getChannelDelivery(
    query: GetChannelDeliveryQuery,
  ): Promise<GetChannelDeliveryResult>;
}
