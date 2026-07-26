import type { UserProfile } from "../../../domain/user-profile";

export interface ProfileRepositoryPort {
  findByAccountId(accountId: string): Promise<UserProfile | null>;
  replace(profile: UserProfile): Promise<void>;
}
