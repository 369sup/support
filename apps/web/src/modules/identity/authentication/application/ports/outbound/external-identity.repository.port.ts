import type { AccountReference } from "@/modules/identity/accounts/integration-contracts";

export type ExternalIdentityAccount = Readonly<{
  account: AccountReference;
  email: string;
  provider: "supabase";
  subject: string;
}>;

export interface ExternalIdentityRepositoryPort {
  isExternalOnboardingReady(): Promise<boolean>;
  isReady(): Promise<boolean>;
  findBySubject(
    provider: "supabase",
    subject: string,
  ): Promise<ExternalIdentityAccount | null>;
  findVerifiedEmailByUsername(username: string): Promise<string | null>;
  isUsernameAvailable(username: string): Promise<boolean>;
}
