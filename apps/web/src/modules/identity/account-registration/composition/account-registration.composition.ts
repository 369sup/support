import { AccountIdentityAdapter } from "../adapters/outbound/integration/account-identity.adapter";
import { PasswordCredentialAdapter } from "../adapters/outbound/integration/password-credential.adapter";
import { InMemoryAccountRegistrationIdGeneratorAdapter } from "../adapters/outbound/persistence/in-memory-account-registration-id-generator.adapter";
import { ChangePersonalAccountUsernameHandler } from "../application/commands/change-personal-account-username.handler";
import { RegisterPersonalAccountHandler } from "../application/commands/register-personal-account.handler";
import type { ChangePersonalAccountUsernameUseCase } from "../application/ports/inbound/change-personal-account-username.use-case";
import type { RegisterPersonalAccountUseCase } from "../application/ports/inbound/register-personal-account.use-case";
import { AccountRegistrationService } from "../application/services/account-registration.service";

export interface AccountRegistrationServerFacade {
  changePersonalAccountUsername: ChangePersonalAccountUsernameUseCase["changePersonalAccountUsername"];
  registerPersonalAccount: RegisterPersonalAccountUseCase["registerPersonalAccount"];
}

function composeAccountRegistrationServerFacade(): AccountRegistrationServerFacade {
  const service = new AccountRegistrationService(
    new AccountIdentityAdapter(),
    new PasswordCredentialAdapter(),
    new InMemoryAccountRegistrationIdGeneratorAdapter(),
  );
  const changeUsername = new ChangePersonalAccountUsernameHandler(service);
  const register = new RegisterPersonalAccountHandler(service);

  return {
    changePersonalAccountUsername: (command) =>
      changeUsername.changePersonalAccountUsername(command),
    registerPersonalAccount: (command) =>
      register.registerPersonalAccount(command),
  };
}

export const accountRegistrationServerFacade =
  composeAccountRegistrationServerFacade();
