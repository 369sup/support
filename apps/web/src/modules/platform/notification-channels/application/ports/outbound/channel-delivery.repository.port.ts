import type { ChannelDelivery } from "../../../domain/channel-delivery";

export interface ChannelDeliveryRepositoryPort {
  findById(deliveryId: string): Promise<ChannelDelivery | null>;
  findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<ChannelDelivery | null>;
  save(delivery: ChannelDelivery): Promise<void>;
}
