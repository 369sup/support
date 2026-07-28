export interface SecurityRuntimeGatewayPort {
  hashSecret(secret: string): string;
  now(): Date;
  protectSecret(secret: string): string;
  randomId(): string;
  randomRecoveryCode(): string;
  revealSecret(protectedSecret: string): string;
}
