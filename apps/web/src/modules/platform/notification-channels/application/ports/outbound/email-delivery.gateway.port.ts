export type EmailDeliveryRequest = Readonly<{
  html: string | null;
  recipient: string;
  subject: string;
  text: string;
}>;

export type EmailDeliveryGatewayResult =
  | Readonly<{
      status: "delivered";
      providerReference: string;
    }>
  | Readonly<{
      status: "configuration-unavailable" | "provider-failed";
      failureCode: string;
    }>;

export interface EmailDeliveryGatewayPort {
  deliver(
    request: EmailDeliveryRequest,
  ): Promise<EmailDeliveryGatewayResult>;
}
