import { accountEmailsServerFacade } from "./composition/account-emails.composition";

export const addAccountEmail =
  accountEmailsServerFacade.addAccountEmail;
export const listAccountEmails =
  accountEmailsServerFacade.listAccountEmails;
export const updateAccountEmailSettings =
  accountEmailsServerFacade.updateAccountEmailSettings;
export const verifyAccountEmail =
  accountEmailsServerFacade.verifyAccountEmail;
