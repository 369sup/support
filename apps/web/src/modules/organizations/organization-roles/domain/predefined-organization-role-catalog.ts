import type { PredefinedOrganizationRoleDefinition } from "./organization-role";

export const predefinedOrganizationRoleCatalog: readonly PredefinedOrganizationRoleDefinition[] =
  [
    {
      roleKey: "moderator",
      displayName: "Moderator",
      description: "Moderate organization community interactions.",
      organizationPermissions: ["moderate-organization"],
      repositoryPermission: null,
    },
    {
      roleKey: "security-manager",
      displayName: "Security manager",
      description: "Manage organization security and read all repositories.",
      organizationPermissions: ["manage-security"],
      repositoryPermission: "read",
    },
    {
      roleKey: "ci-cd-admin",
      displayName: "CI/CD admin",
      description: "Manage organization CI/CD settings.",
      organizationPermissions: ["manage-ci-cd"],
      repositoryPermission: null,
    },
    {
      roleKey: "app-manager",
      displayName: "App manager",
      description: "Manage organization-owned app registrations.",
      organizationPermissions: ["manage-app-registrations"],
      repositoryPermission: null,
    },
    {
      roleKey: "all-repository-read",
      displayName: "All-repository read",
      description: "Read every repository in the organization.",
      organizationPermissions: [],
      repositoryPermission: "read",
    },
    {
      roleKey: "all-repository-triage",
      displayName: "All-repository triage",
      description: "Triage every repository in the organization.",
      organizationPermissions: [],
      repositoryPermission: "triage",
    },
    {
      roleKey: "all-repository-write",
      displayName: "All-repository write",
      description: "Write to every repository in the organization.",
      organizationPermissions: [],
      repositoryPermission: "write",
    },
    {
      roleKey: "all-repository-maintain",
      displayName: "All-repository maintain",
      description: "Maintain every repository in the organization.",
      organizationPermissions: [],
      repositoryPermission: "maintain",
    },
    {
      roleKey: "all-repository-admin",
      displayName: "All-repository admin",
      description: "Administer every repository in the organization.",
      organizationPermissions: [],
      repositoryPermission: "admin",
    },
  ];
