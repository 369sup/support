import { accountsServerFacade } from "./composition/accounts.composition";

export type {
  PersonalAccountLookupResult,
  UserOwnerReference,
} from "./contracts/user-owner-reference";
export type {
  AccountReference,
  AccountReferenceLookupResult,
  ActorReference,
} from "./contracts/account-reference";
export const getAccountReferenceById =
  accountsServerFacade.getAccountReferenceById;
export const getPersonalAccountByUsername =
  accountsServerFacade.getPersonalAccountByUsername;
