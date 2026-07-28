import "server-only";

import { deliverEmail } from "@/modules/platform/notification-channels/server-api";

import type { EmailVerificationDeliveryGatewayPort } from "../../application/ports/outbound/email-verification-delivery.gateway.port";

function verificationBaseUrl(): string {
  const configured = process.env["NEXT_PUBLIC_SITE_URL"]?.trim();
  return configured === undefined || configured === ""
    ? "http://localhost:3000"
    : configured.replace(/\/$/, "");
}

export class NotificationChannelVerificationDeliveryAdapter
  implements EmailVerificationDeliveryGatewayPort
{
  async deliverVerification(input: {
    address: string;
    idempotencyKey: string;
    token: string;
  }): Promise<boolean> {
    const verificationUrl = `${verificationBaseUrl()}/verify-email?token=${encodeURIComponent(input.token)}`;
    const result = await deliverEmail({
      idempotencyKey: input.idempotencyKey,
      recipient: input.address,
      subject: "Verify your Support email address",
      text: `Verify your email address: ${verificationUrl}`,
    });
    return (
      result.status === "delivered" ||
      result.status === "already-processed"
    );
  }
}
