import type {
  GetChannelDeliveryQuery,
  GetChannelDeliveryResult,
  GetChannelDeliveryUseCase,
} from "../ports/inbound/get-channel-delivery.use-case";
import type { ChannelDeliveryService } from "../services/channel-delivery.service";

export class GetChannelDeliveryHandler
  implements GetChannelDeliveryUseCase
{
  private readonly service: ChannelDeliveryService;

  constructor(service: ChannelDeliveryService) {
    this.service = service;
  }

  getChannelDelivery(
    query: GetChannelDeliveryQuery,
  ): Promise<GetChannelDeliveryResult> {
    return this.service.getChannelDelivery(query);
  }
}
