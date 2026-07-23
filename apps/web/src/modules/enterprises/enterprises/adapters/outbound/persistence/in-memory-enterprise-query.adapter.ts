import type {
  EnterpriseQueryRepositoryPort,
  EnterpriseQuerySnapshot,
} from "../../../application/ports/outbound/enterprise-query.repository.port";

const developmentEnterprises: readonly EnterpriseQuerySnapshot[] = [
  {
    enterpriseId: "enterprise_acme",
    slug: "acme-enterprise",
    displayName: "ACME Enterprise",
    enterpriseType: "managed-users",
    lifecycleState: "active",
  },
];

const developmentLinks = new Map<string, readonly string[]>([
  [
    "enterprise_acme",
    ["organization_acme_platform", "organization_acme_support"],
  ],
]);

type EnterpriseStore = Readonly<{
  bySlug: Map<string, EnterpriseQuerySnapshot>;
  organizationIdsByEnterpriseId: Map<string, readonly string[]>;
}>;

declare global {
  var __supportEnterpriseStoreV1: EnterpriseStore | undefined;
}

function createStore(): EnterpriseStore {
  return {
    bySlug: new Map(
      developmentEnterprises.map((enterprise) => [
        enterprise.slug,
        enterprise,
      ]),
    ),
    organizationIdsByEnterpriseId: new Map(developmentLinks),
  };
}

function getProcessStore(): EnterpriseStore {
  globalThis.__supportEnterpriseStoreV1 ??= createStore();
  return globalThis.__supportEnterpriseStoreV1;
}

export class InMemoryEnterpriseQueryAdapter
  implements EnterpriseQueryRepositoryPort
{
  private readonly store: EnterpriseStore;

  constructor(store = getProcessStore()) {
    this.store = store;
  }

  findBySlug(slug: string): Promise<EnterpriseQuerySnapshot | null> {
    return Promise.resolve(this.store.bySlug.get(slug) ?? null);
  }

  findOrganizationIds(enterpriseId: string): Promise<readonly string[]> {
    return Promise.resolve(
      this.store.organizationIdsByEnterpriseId.get(enterpriseId) ?? [],
    );
  }
}
