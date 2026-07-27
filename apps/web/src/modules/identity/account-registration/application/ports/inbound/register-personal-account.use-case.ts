export type RegisterPersonalAccountCommand = Readonly<{
  username: string;
  password: string;
}>;

export type RegisterPersonalAccountResult =
  | Readonly<{
      status: "created";
      account: Readonly<{ accountId: string; username: string }>;
    }>
  | Readonly<{
      status:
        | "invalid-username"
        | "registration-failed"
        | "username-conflict"
        | "weak-password";
    }>;

export interface RegisterPersonalAccountUseCase {
  registerPersonalAccount(
    command: RegisterPersonalAccountCommand,
  ): Promise<RegisterPersonalAccountResult>;
}
