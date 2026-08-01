export interface AccountRegistrationIdGeneratorPort {
  nextAccountId(): string;
  nextTransactionId(): string;
}
