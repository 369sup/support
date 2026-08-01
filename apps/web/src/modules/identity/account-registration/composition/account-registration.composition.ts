import { AccountIdentityAdapter } from "../adapters/outbound/integration/account-identity.adapter";
import { NodeAccountRegistrationIdGeneratorAdapter } from "../adapters/outbound/persistence/node-account-registration-id-generator.adapter";
import { ChangePersonalAccountUsernameHandler } from "../application/commands/change-personal-account-username.handler";
import type { ChangePersonalAccountUsernameUseCase } from "../application/ports/inbound/change-personal-account-username.use-case";
import { PersonalAccountUsernameService } from "../application/services/personal-account-username.service";

export interface AccountRegistrationServerFacade {
  changePersonalAccountUsername: ChangePersonalAccountUsernameUseCase["changePersonalAccountUsername"];
}

function composeAccountRegistrationServerFacade(): AccountRegistrationServerFacade {
  const service = new PersonalAccountUsernameService(
    new AccountIdentityAdapter(),
    new NodeAccountRegistrationIdGeneratorAdapter(),
  );
  const changeUsername = new ChangePersonalAccountUsernameHandler(service);

  return {
    changePersonalAccountUsername: (command) =>
      changeUsername.changePersonalAccountUsername(command),
  };
}

export const accountRegistrationServerFacade =
  composeAccountRegistrationServerFacade();
