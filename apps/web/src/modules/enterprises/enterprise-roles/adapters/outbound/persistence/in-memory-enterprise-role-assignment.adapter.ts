import type {
  EnterpriseRoleAssignmentRepositoryPort,
  EnterpriseRoleAssignmentSnapshot,
} from "../../../application/ports/outbound/enterprise-role-assignment.repository.port";

const developmentAssignments: readonly EnterpriseRoleAssignmentSnapshot[] = [
  {
    assignmentId: "enterprise_role_assignment_carol_acme_admin",
    enterpriseId: "enterprise_acme",
    accountId: "account_carol_acme",
    roleName: "enterprise-admin",
    permissions: ["view-enterprise"],
  },
];

type EnterpriseRoleAssignmentStore = Readonly<{
  byId: Map<string, EnterpriseRoleAssignmentSnapshot>;
  idsByAccountAndEnterprise: Map<string, readonly string[]>;
}>;

declare global {
  var __supportEnterpriseRoleAssignmentStoreV1:
    | EnterpriseRoleAssignmentStore
    | undefined;
}

function assignmentIndexKey(accountId: string, enterpriseId: string) {
  return `${accountId}\u0000${enterpriseId}`;
}

function createStore(
  assignments: readonly EnterpriseRoleAssignmentSnapshot[],
): EnterpriseRoleAssignmentStore {
  const byId = new Map<string, EnterpriseRoleAssignmentSnapshot>();
  const mutableIdsByAccountAndEnterprise = new Map<string, string[]>();
  for (const assignment of assignments) {
    byId.set(assignment.assignmentId, assignment);
    const key = assignmentIndexKey(
      assignment.accountId,
      assignment.enterpriseId,
    );
    const assignmentIds = mutableIdsByAccountAndEnterprise.get(key) ?? [];
    assignmentIds.push(assignment.assignmentId);
    mutableIdsByAccountAndEnterprise.set(key, assignmentIds);
  }
  return {
    byId,
    idsByAccountAndEnterprise: mutableIdsByAccountAndEnterprise,
  };
}

function getProcessStore(): EnterpriseRoleAssignmentStore {
  globalThis.__supportEnterpriseRoleAssignmentStoreV1 ??= createStore(
    developmentAssignments,
  );
  return globalThis.__supportEnterpriseRoleAssignmentStoreV1;
}

export class InMemoryEnterpriseRoleAssignmentAdapter
  implements EnterpriseRoleAssignmentRepositoryPort
{
  private readonly store: EnterpriseRoleAssignmentStore;

  constructor(
    assignments?: readonly EnterpriseRoleAssignmentSnapshot[],
  ) {
    this.store =
      assignments === undefined
        ? getProcessStore()
        : createStore(assignments);
  }

  findByAccountAndEnterprise(
    accountId: string,
    enterpriseId: string,
  ): Promise<readonly EnterpriseRoleAssignmentSnapshot[]> {
    const assignmentIds =
      this.store.idsByAccountAndEnterprise.get(
        assignmentIndexKey(accountId, enterpriseId),
      ) ?? [];
    return Promise.resolve(
      assignmentIds.flatMap((assignmentId) => {
        const assignment = this.store.byId.get(assignmentId);
        return assignment === undefined ? [] : [assignment];
      }),
    );
  }
}
