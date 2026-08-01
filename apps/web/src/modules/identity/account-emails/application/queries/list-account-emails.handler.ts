import type {
  ListAccountEmailsQuery,
  ListAccountEmailsResult,
  ListAccountEmailsUseCase,
} from "../ports/inbound/list-account-emails.use-case";
import type { AccountEmailService } from "../services/account-email.service";

export class ListAccountEmailsHandler
  implements ListAccountEmailsUseCase
{
  private readonly service: AccountEmailService;

  constructor(service: AccountEmailService) {
    this.service = service;
  }

  listAccountEmails(
    query: ListAccountEmailsQuery,
  ): Promise<ListAccountEmailsResult> {
    return this.service.listAccountEmails(query);
  }
}
