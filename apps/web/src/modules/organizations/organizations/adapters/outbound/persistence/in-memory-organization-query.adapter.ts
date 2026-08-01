import type {
  OrganizationQueryRepositoryPort,
  OrganizationQuerySnapshot,
} from "../../../application/ports/outbound/organization-query.repository.port";

const developmentOrganizations: readonly OrganizationQuerySnapshot[] = [
  {
    organizationId: "organization_community_lab",
    login: "community-lab",
    displayName: "Community Lab",
    lifecycleState: "active",
  },
  {
    organizationId: "organization_acme_platform",
    login: "acme-platform",
    displayName: "ACME Platform",
    lifecycleState: "active",
  },
  {
    organizationId: "organization_acme_support",
    login: "acme-support",
    displayName: "ACME Support",
    lifecycleState: "active",
  },
];

type OrganizationStore = Readonly<{
  byId: Map<string, OrganizationQuerySnapshot>;
  idByLogin: Map<string, string>;
}>;

declare global {
  var __supportOrganizationStoreV1: OrganizationStore | undefined;
}

function createStore(
  organizations: readonly OrganizationQuerySnapshot[],
): OrganizationStore {
  return {
    byId: new Map(
      organizations.map((organization) => [
        organization.organizationId,
        organization,
      ]),
    ),
    idByLogin: new Map(
      organizations.map((organization) => [
        organization.login,
        organization.organizationId,
      ]),
    ),
  };
}

function getProcessStore(): OrganizationStore {
  globalThis.__supportOrganizationStoreV1 ??= createStore(
    developmentOrganizations,
  );
  return globalThis.__supportOrganizationStoreV1;
}

export class InMemoryOrganizationQueryAdapter
  implements OrganizationQueryRepositoryPort
{
  private readonly store: OrganizationStore;

  constructor(organizations?: readonly OrganizationQuerySnapshot[]) {
    this.store =
      organizations === undefined
        ? getProcessStore()
        : createStore(organizations);
  }

  findById(
    organizationId: string,
  ): Promise<OrganizationQuerySnapshot | null> {
    return Promise.resolve(this.store.byId.get(organizationId) ?? null);
  }

  findByLogin(login: string): Promise<OrganizationQuerySnapshot | null> {
    const organizationId = this.store.idByLogin.get(login);
    return Promise.resolve(
      organizationId === undefined
        ? null
        : (this.store.byId.get(organizationId) ?? null),
    );
  }
}
