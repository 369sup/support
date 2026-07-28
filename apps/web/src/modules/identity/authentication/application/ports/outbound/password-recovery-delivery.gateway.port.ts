export interface PasswordRecoveryDeliveryGatewayPort {
  deliverPasswordReset(input: {
    address: string;
    idempotencyKey: string;
    token: string;
  }): Promise<boolean>;
}
