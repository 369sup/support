import type { AccountQuerySnapshot } from "./account-query.repository.port";

export interface AccountLifecycleRepositoryPort {
  findById(accountId: string): Promise<AccountQuerySnapshot | null>;
  markDeleted(accountId: string): Promise<void>;
}
