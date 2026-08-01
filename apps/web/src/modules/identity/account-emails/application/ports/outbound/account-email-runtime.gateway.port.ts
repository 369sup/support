export interface AccountEmailRuntimeGatewayPort {
  hashToken(token: string): string;
  now(): Date;
  randomId(): string;
  randomToken(): string;
}
