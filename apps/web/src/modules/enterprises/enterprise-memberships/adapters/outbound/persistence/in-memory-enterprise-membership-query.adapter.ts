import type {
  EnterpriseMembershipQueryRepositoryPort,
  EnterpriseMembershipQuerySnapshot,
} from "../../../application/ports/outbound/enterprise-membership-query.repository.port";

const developmentMemberships: readonly EnterpriseMembershipQuerySnapshot[] = [
  {
    membershipId: "enterprise_membership_carol_acme",
    enterpriseId: "enterprise_acme",
    accountId: "account_carol_acme",
    affiliation: "direct",
    state: "active",
  },
];

type EnterpriseMembershipStore = Readonly<{
  byAccountId: Map<string, readonly EnterpriseMembershipQuerySnapshot[]>;
}>;

declare global {
  var __supportEnterpriseMembershipStoreV1:
    | EnterpriseMembershipStore
    | undefined;
}

function createStore(): EnterpriseMembershipStore {
  const byAccountId = new Map<
    string,
    readonly EnterpriseMembershipQuerySnapshot[]
  >();
  for (const membership of developmentMemberships) {
    byAccountId.set(membership.accountId, [
      ...(byAccountId.get(membership.accountId) ?? []),
      membership,
    ]);
  }
  return { byAccountId };
}

function getProcessStore(): EnterpriseMembershipStore {
  globalThis.__supportEnterpriseMembershipStoreV1 ??= createStore();
  return globalThis.__supportEnterpriseMembershipStoreV1;
}

export class InMemoryEnterpriseMembershipQueryAdapter
  implements EnterpriseMembershipQueryRepositoryPort
{
  private readonly store: EnterpriseMembershipStore;

  constructor(store = getProcessStore()) {
    this.store = store;
  }

  findByAccountId(
    accountId: string,
  ): Promise<readonly EnterpriseMembershipQuerySnapshot[]> {
    return Promise.resolve(this.store.byAccountId.get(accountId) ?? []);
  }
}
