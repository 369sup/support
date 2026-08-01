import "server-only";

import { deliverEmail } from "@/modules/platform/notification-channels/server-api";

import type { PasswordRecoveryDeliveryGatewayPort } from "../../../application/ports/outbound/password-recovery-delivery.gateway.port";

function applicationBaseUrl(): string {
  const configured = process.env["NEXT_PUBLIC_SITE_URL"]?.trim();
  return configured === undefined || configured === ""
    ? "http://localhost:3000"
    : configured.replace(/\/$/, "");
}

export class NotificationChannelPasswordRecoveryAdapter
  implements PasswordRecoveryDeliveryGatewayPort
{
  async deliverPasswordReset(input: {
    address: string;
    idempotencyKey: string;
    token: string;
  }): Promise<boolean> {
    const resetUrl = `${applicationBaseUrl()}/reset-password?token=${encodeURIComponent(input.token)}`;
    const result = await deliverEmail({
      idempotencyKey: input.idempotencyKey,
      recipient: input.address,
      subject: "Reset your Support password",
      text: `Reset your password: ${resetUrl}`,
    });
    return (
      result.status === "delivered" ||
      result.status === "already-processed"
    );
  }
}
