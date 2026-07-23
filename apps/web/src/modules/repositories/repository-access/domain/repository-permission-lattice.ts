import type { RepositoryPermission } from "../contracts/effective-repository-permission-decision";

const permissionRank: Readonly<Record<RepositoryPermission, number>> = {
  read: 1,
  triage: 2,
  write: 3,
  maintain: 4,
  admin: 5,
};

export function compareRepositoryPermission(
  left: RepositoryPermission,
  right: RepositoryPermission,
) {
  return permissionRank[left] - permissionRank[right];
}
