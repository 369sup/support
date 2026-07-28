import type {
  DeliverEmailCommand,
  DeliverEmailResult,
  DeliverEmailUseCase,
} from "../ports/inbound/deliver-email.use-case";
import type { ChannelDeliveryService } from "../services/channel-delivery.service";

export class DeliverEmailHandler implements DeliverEmailUseCase {
  private readonly service: ChannelDeliveryService;

  constructor(service: ChannelDeliveryService) {
    this.service = service;
  }

  deliverEmail(
    command: DeliverEmailCommand,
  ): Promise<DeliverEmailResult> {
    return this.service.deliverEmail(command);
  }
}
