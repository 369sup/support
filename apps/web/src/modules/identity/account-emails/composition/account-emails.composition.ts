import { getProductionDatabase } from "../../../../../production-runtime";
import { NodeAccountEmailRuntimeAdapter } from "../adapters/outbound/node-account-email-runtime.adapter";
import { NotificationChannelVerificationDeliveryAdapter } from "../adapters/outbound/notification-channel-verification-delivery.adapter";
import { InMemoryAccountEmailAdapter } from "../adapters/outbound/persistence/in-memory-account-email.adapter";
import { PostgresAccountEmailAdapter } from "../adapters/outbound/persistence/postgres-account-email.adapter";
import { AddAccountEmailHandler } from "../application/commands/add-account-email.handler";
import { UpdateAccountEmailSettingsHandler } from "../application/commands/update-account-email-settings.handler";
import { VerifyAccountEmailHandler } from "../application/commands/verify-account-email.handler";
import { ListAccountEmailsHandler } from "../application/queries/list-account-emails.handler";
import { AccountEmailService } from "../application/services/account-email.service";

const database = getProductionDatabase();
const repository =
  database === null
    ? new InMemoryAccountEmailAdapter()
    : new PostgresAccountEmailAdapter(database);
const service = new AccountEmailService(
  repository,
  new NodeAccountEmailRuntimeAdapter(),
  new NotificationChannelVerificationDeliveryAdapter(),
);
const addHandler = new AddAccountEmailHandler(service);
const listHandler = new ListAccountEmailsHandler(service);
const settingsHandler = new UpdateAccountEmailSettingsHandler(service);
const verificationHandler = new VerifyAccountEmailHandler(service);

export const accountEmailsServerFacade = {
  addAccountEmail: addHandler.addAccountEmail.bind(addHandler),
  listAccountEmails: listHandler.listAccountEmails.bind(listHandler),
  updateAccountEmailSettings:
    settingsHandler.updateAccountEmailSettings.bind(settingsHandler),
  verifyAccountEmail:
    verificationHandler.verifyAccountEmail.bind(verificationHandler),
};
