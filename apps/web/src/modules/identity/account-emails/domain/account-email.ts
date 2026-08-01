export type AccountEmailOwnership = "personal" | "scim";

export type AccountEmail = Readonly<{
  accountId: string;
  address: string;
  createdAt: string;
  emailId: string;
  isPrimary: boolean;
  isPublic: boolean;
  isVerified: boolean;
  ownership: AccountEmailOwnership;
}>;

export type OrganizationNotificationRoute = Readonly<{
  accountId: string;
  emailId: string;
  organizationId: string;
  updatedAt: string;
}>;

export type EmailVerification = Readonly<{
  emailId: string;
  expiresAt: string;
  tokenHash: string;
}>;
