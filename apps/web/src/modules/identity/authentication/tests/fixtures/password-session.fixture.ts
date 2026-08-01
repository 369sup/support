import type {
  CreatePasswordSessionCommand,
  CreatePasswordSessionResult,
  CreatePasswordSessionUseCase,
} from "./password-session-contract.fixture";
import type { CreateDevelopmentSessionUseCase } from "./development-session-contract.fixture";

export class CreatePasswordSessionHandler
  implements CreatePasswordSessionUseCase
{
  private readonly delegate: CreateDevelopmentSessionUseCase;

  constructor(delegate: CreateDevelopmentSessionUseCase) {
    this.delegate = delegate;
  }

  createPasswordSession(
    command: CreatePasswordSessionCommand,
  ): Promise<CreatePasswordSessionResult> {
    return this.delegate.createDevelopmentSession(command);
  }
}
