import "server-only";

import { getProductionDatabase } from "../../../../../production-runtime";
import { NodeChannelRuntimeAdapter } from "../adapters/outbound/node-channel-runtime.adapter";
import { PostgresChannelDeliveryAdapter } from "../adapters/outbound/persistence/postgres-channel-delivery.adapter";
import { SmtpEmailDeliveryAdapter } from "../adapters/outbound/smtp-email-delivery.adapter";
import { UnavailableEmailDeliveryAdapter } from "../adapters/outbound/unavailable-email-delivery.adapter";
import { DeliverEmailHandler } from "../application/commands/deliver-email.handler";
import { GetChannelDeliveryHandler } from "../application/queries/get-channel-delivery.handler";
import { ChannelDeliveryService } from "../application/services/channel-delivery.service";

function optionalNonEmpty(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized === undefined || normalized === ""
    ? undefined
    : normalized;
}

function readSmtpPort(): number {
  const value = Number(process.env["SMTP_PORT"]);
  return Number.isInteger(value) && value > 0 && value <= 65_535
    ? value
    : 587;
}

const database = getProductionDatabase();
const repository = new PostgresChannelDeliveryAdapter(database);
const smtpHost = optionalNonEmpty(process.env["SMTP_HOST"]);
const smtpFromAddress = optionalNonEmpty(
  process.env["SMTP_FROM_ADDRESS"],
);
const smtpUsername = optionalNonEmpty(process.env["SMTP_USERNAME"]);
const smtpPassword = optionalNonEmpty(process.env["SMTP_PASSWORD"]);
const smtpGateway =
  smtpHost === undefined || smtpFromAddress === undefined
    ? new UnavailableEmailDeliveryAdapter()
    : new SmtpEmailDeliveryAdapter({
        fromAddress: smtpFromAddress,
        host: smtpHost,
        ...(smtpPassword === undefined
          ? {}
          : { password: smtpPassword }),
        port: readSmtpPort(),
        isSecure: process.env["SMTP_SECURE"] === "true",
        ...(smtpUsername === undefined
          ? {}
          : { username: smtpUsername }),
      });
const service = new ChannelDeliveryService(
  repository,
  smtpGateway,
  new NodeChannelRuntimeAdapter(),
);
const deliverHandler = new DeliverEmailHandler(service);
const queryHandler = new GetChannelDeliveryHandler(service);

export const notificationChannelsServerFacade = {
  deliverEmail: deliverHandler.deliverEmail.bind(deliverHandler),
  getChannelDelivery:
    queryHandler.getChannelDelivery.bind(queryHandler),
};
