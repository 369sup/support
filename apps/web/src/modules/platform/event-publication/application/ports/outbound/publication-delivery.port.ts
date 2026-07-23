import type { PublicationEventEnvelope } from "../../../domain/publication-record";

export type PublicationDeliveryResult =
  | Readonly<{ status: "delivered" }>
  | Readonly<{ status: "failed"; errorCode: string }>;

export interface PublicationDeliveryPort {
  deliver(
    envelope: PublicationEventEnvelope,
  ): Promise<PublicationDeliveryResult>;
}
