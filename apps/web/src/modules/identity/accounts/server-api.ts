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
export const getAccountCandidateByUsername =
  accountsServerFacade.getAccountCandidateByUsername;
export const applyAccountIdentityTransaction =
  accountsServerFacade.applyAccountIdentityTransaction;
export const getAccountReferenceById =
  accountsServerFacade.getAccountReferenceById;
export const deletePersonalAccount =
  accountsServerFacade.deletePersonalAccount;
export const getPersonalAccountByUsername =
  accountsServerFacade.getPersonalAccountByUsername;
