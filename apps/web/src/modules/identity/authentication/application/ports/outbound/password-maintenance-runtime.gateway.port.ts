export interface PasswordMaintenanceRuntimeGatewayPort {
  hashToken(token: string): string;
  now(): Date;
  randomToken(): string;
}
