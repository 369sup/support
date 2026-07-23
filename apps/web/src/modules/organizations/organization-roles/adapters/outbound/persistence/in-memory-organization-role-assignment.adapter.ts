import type { OrganizationRoleAssignmentRepositoryPort } from "../../../application/ports/outbound/organization-role-assignment.repository.port";
import type { OrganizationRoleAssignmentReference } from "../../../contracts/organization-role-reference";

const developmentAssignments: readonly OrganizationRoleAssignmentReference[] = [
  {
    assignmentId: "organization_role_assignment_docs_ops_all_read",
    organizationId: "organization_community_lab",
    roleKey: "moderator",
    subject: { kind: "team", teamId: "team_community_docs_ops" },
    state: "active",
  },
];

type OrganizationRoleAssignmentStore = {
  byId: Map<string, OrganizationRoleAssignmentReference>;
  idsByOrganization: Map<string, string[]>;
  idByOrganizationSubjectAndRole: Map<string, string>;
};

declare global {
  var __supportOrganizationRoleAssignmentStoreV1:
    | OrganizationRoleAssignmentStore
    | undefined;
}

function subjectKey(
  subject: OrganizationRoleAssignmentReference["subject"],
) {
  return subject.kind === "account"
    ? `account:${subject.accountId}`
    : `team:${subject.teamId}`;
}

function assignmentKey(
  organizationId: string,
  subject: string,
  roleKey: string,
) {
  return `${organizationId}\u0000${subject}\u0000${roleKey}`;
}

function createStore(
  assignments: readonly OrganizationRoleAssignmentReference[],
): OrganizationRoleAssignmentStore {
  const store: OrganizationRoleAssignmentStore = {
    byId: new Map(),
    idsByOrganization: new Map(),
    idByOrganizationSubjectAndRole: new Map(),
  };
  for (const assignment of assignments) {
    store.byId.set(assignment.assignmentId, assignment);
    const ids = store.idsByOrganization.get(assignment.organizationId) ?? [];
    store.idsByOrganization.set(assignment.organizationId, [
      ...ids,
      assignment.assignmentId,
    ]);
    store.idByOrganizationSubjectAndRole.set(
      assignmentKey(
        assignment.organizationId,
        subjectKey(assignment.subject),
        assignment.roleKey,
      ),
      assignment.assignmentId,
    );
  }
  return store;
}

function getProcessStore() {
  globalThis.__supportOrganizationRoleAssignmentStoreV1 ??= createStore(
    developmentAssignments,
  );
  return globalThis.__supportOrganizationRoleAssignmentStoreV1;
}

export class InMemoryOrganizationRoleAssignmentAdapter
  implements OrganizationRoleAssignmentRepositoryPort
{
  private readonly store: OrganizationRoleAssignmentStore;

  constructor(assignments?: readonly OrganizationRoleAssignmentReference[]) {
    this.store =
      assignments === undefined ? getProcessStore() : createStore(assignments);
  }

  listByOrganization(organizationId: string) {
    return Promise.resolve(
      (this.store.idsByOrganization.get(organizationId) ?? []).flatMap(
        (assignmentId) => {
          const assignment = this.store.byId.get(assignmentId);
          return assignment === undefined ? [] : [assignment];
        },
      ),
    );
  }

  findById(assignmentId: string) {
    return Promise.resolve(this.store.byId.get(assignmentId) ?? null);
  }

  findActiveByOrganizationSubjectAndRole(
    organizationId: string,
    requestedSubjectKey: string,
    roleKey: string,
  ) {
    const assignmentId =
      this.store.idByOrganizationSubjectAndRole.get(
        assignmentKey(organizationId, requestedSubjectKey, roleKey),
      );
    const assignment =
      assignmentId === undefined
        ? undefined
        : this.store.byId.get(assignmentId);
    return Promise.resolve(
      assignment?.state === "active" ? assignment : null,
    );
  }

  save(assignment: OrganizationRoleAssignmentReference) {
    const isNew = !this.store.byId.has(assignment.assignmentId);
    this.store.byId.set(assignment.assignmentId, assignment);
    if (isNew) {
      const ids =
        this.store.idsByOrganization.get(assignment.organizationId) ?? [];
      this.store.idsByOrganization.set(assignment.organizationId, [
        ...ids,
        assignment.assignmentId,
      ]);
    }
    this.store.idByOrganizationSubjectAndRole.set(
      assignmentKey(
        assignment.organizationId,
        subjectKey(assignment.subject),
        assignment.roleKey,
      ),
      assignment.assignmentId,
    );
    return Promise.resolve();
  }
}
