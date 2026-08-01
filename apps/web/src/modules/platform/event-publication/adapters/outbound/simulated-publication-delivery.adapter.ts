import type {
  PublicationDeliveryPort,
  PublicationDeliveryResult,
} from "../../application/ports/outbound/publication-delivery.port";

export class SimulatedPublicationDeliveryAdapter
  implements PublicationDeliveryPort
{
  deliver(): Promise<PublicationDeliveryResult> {
    return Promise.resolve({ status: "delivered" });
  }
}
