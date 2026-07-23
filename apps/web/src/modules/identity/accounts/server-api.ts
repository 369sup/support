import { accountsServerFacade } from "./composition/accounts.composition";

export type {
  PersonalAccountLookupResult,
  UserOwnerReference,
} from "./contracts/user-owner-reference";
export const getPersonalAccountByUsername =
  accountsServerFacade.getPersonalAccountByUsername;
