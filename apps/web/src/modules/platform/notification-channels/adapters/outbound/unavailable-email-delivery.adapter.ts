import type {
  EmailDeliveryGatewayPort,
  EmailDeliveryGatewayResult,
} from "../../application/ports/outbound/email-delivery.gateway.port";

export class UnavailableEmailDeliveryAdapter
  implements EmailDeliveryGatewayPort
{
  deliver(): Promise<EmailDeliveryGatewayResult> {
    return Promise.resolve({
      status: "configuration-unavailable",
      failureCode: "smtp-not-configured",
    });
  }
}
