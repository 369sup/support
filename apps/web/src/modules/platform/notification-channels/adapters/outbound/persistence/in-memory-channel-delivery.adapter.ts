import type { ChannelDeliveryRepositoryPort } from "../../../application/ports/outbound/channel-delivery.repository.port";
import type { ChannelDelivery } from "../../../domain/channel-delivery";

type ChannelDeliveryStore = Map<string, ChannelDelivery>;

declare global {
  var __supportChannelDeliveryStoreV1:
    | ChannelDeliveryStore
    | undefined;
}

function getProcessStore(): ChannelDeliveryStore {
  globalThis.__supportChannelDeliveryStoreV1 ??= new Map();
  return globalThis.__supportChannelDeliveryStoreV1;
}

export class InMemoryChannelDeliveryAdapter
  implements ChannelDeliveryRepositoryPort
{
  private readonly store: ChannelDeliveryStore;

  constructor(store: ChannelDeliveryStore = getProcessStore()) {
    this.store = store;
  }

  findById(deliveryId: string): Promise<ChannelDelivery | null> {
    return Promise.resolve(this.store.get(deliveryId) ?? null);
  }

  findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<ChannelDelivery | null> {
    return Promise.resolve(
      [...this.store.values()].find(
        (delivery) => delivery.idempotencyKey === idempotencyKey,
      ) ?? null,
    );
  }

  save(delivery: ChannelDelivery): Promise<void> {
    this.store.set(delivery.deliveryId, { ...delivery });
    return Promise.resolve();
  }
}
