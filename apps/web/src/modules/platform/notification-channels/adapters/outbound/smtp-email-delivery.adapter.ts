import "server-only";

import {
  createTransport,
  type Transporter,
} from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

import type {
  EmailDeliveryGatewayPort,
  EmailDeliveryGatewayResult,
  EmailDeliveryRequest,
} from "../../application/ports/outbound/email-delivery.gateway.port";

type SmtpConfiguration = Readonly<{
  fromAddress: string;
  host: string;
  password?: string;
  port: number;
  isSecure: boolean;
  username?: string;
}>;

export class SmtpEmailDeliveryAdapter
  implements EmailDeliveryGatewayPort
{
  private readonly configuration: SmtpConfiguration;
  private readonly transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;

  constructor(configuration: SmtpConfiguration) {
    this.configuration = configuration;
    const hasAuthentication =
      configuration.username !== undefined &&
      configuration.password !== undefined;
    const transportOptions: SMTPTransport.Options = {
      ...(hasAuthentication
        ? {
            auth: {
              pass: configuration.password,
              user: configuration.username,
            },
          }
        : {}),
      disableFileAccess: true,
      disableUrlAccess: true,
      host: configuration.host,
      port: configuration.port,
      requireTLS: !configuration.isSecure,
      secure: configuration.isSecure,
    };
    this.transporter = createTransport(transportOptions);
  }

  async deliver(
    request: EmailDeliveryRequest,
  ): Promise<EmailDeliveryGatewayResult> {
    try {
      const result = await this.transporter.sendMail({
        from: this.configuration.fromAddress,
        ...(request.html === null ? {} : { html: request.html }),
        subject: request.subject,
        text: request.text,
        to: request.recipient,
      });
      return {
        status: "delivered",
        providerReference: result.messageId,
      };
    } catch {
      return {
        status: "provider-failed",
        failureCode: "smtp-delivery-failed",
      };
    }
  }
}
