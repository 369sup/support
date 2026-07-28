import type {
  CreatePasswordSessionCommand,
  CreatePasswordSessionResult,
  CreatePasswordSessionUseCase,
} from "../ports/inbound/create-password-session.use-case";
import type { CreateDevelopmentSessionUseCase } from "../ports/inbound/create-development-session.use-case";

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
