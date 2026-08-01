import { describe, expect, it } from "vitest";

import { ResolveAppAccessDecisionHandler } from "../application/queries/resolve-app-access-decision.handler";
import {
  InMemoryOrganizationAppAccessPolicyQueryAdapter,
  type InMemoryOrganizationAppAccessPolicyRecord,
} from "../adapters/outbound/persistence/in-memory-organization-app-access-policy-query.adapter";

describe("resolve-app-access decision", () => {
  const policyFixture = (): InMemoryOrganizationAppAccessPolicyRecord => ({
    organizationId: "organization_test",
    oauthAppAccess: {
      organizationId: "organization_test",
      isOutsideCollaboratorAllowed: false,
      allowedScopes: ["repo", "read:org"],
    },
    githubAppInstallation: {
      organizationId: "organization_test",
      isOutsideCollaboratorAllowed: false,
      hasOwnerApprovalRequiredForAdditionalPermissions: true,
    },
  });

  it("allows OAuth authorization when member scope is allowed", async () => {
    const handler = new ResolveAppAccessDecisionHandler(
      new InMemoryOrganizationAppAccessPolicyQueryAdapter([policyFixture()]),
    );

    await expect(
      handler.resolveAppAccessDecision({
        kind: "oauth-authorization",
        organizationId: "organization_test",
        scope: "oauth-authorization",
        actorMembership: "member",
        requestedScopes: ["repo", "read:org"],
      }),
    ).resolves.toMatchObject({ status: "allowed" });
  });

  it("denies OAuth authorization for outside collaborators", async () => {
    const handler = new ResolveAppAccessDecisionHandler(
      new InMemoryOrganizationAppAccessPolicyQueryAdapter([policyFixture()]),
    );

    const decision = await handler.resolveAppAccessDecision({
        kind: "oauth-authorization",
        organizationId: "organization_test",
        scope: "oauth-authorization",
        actorMembership: "outside-collaborator",
        requestedScopes: ["repo"],
    });
    expect(decision).toMatchObject({
      status: "denied",
      reason: "outside-collaborator-blocked",
    });
    expect(decision.policy.organizationId).toBe("organization_test");
  });

  it("denies OAuth authorization when scope is outside policy", async () => {
    const handler = new ResolveAppAccessDecisionHandler(
      new InMemoryOrganizationAppAccessPolicyQueryAdapter([policyFixture()]),
    );

    const decision = await handler.resolveAppAccessDecision({
        kind: "oauth-authorization",
        organizationId: "organization_test",
        scope: "oauth-authorization",
        actorMembership: "member",
        requestedScopes: ["user:email"],
    });
    expect(decision).toMatchObject({
      status: "denied",
      reason: "scope-restricted",
      details: {
        deniedScopes: ["user:email"],
      },
    });
    expect(decision.policy.organizationId).toBe("organization_test");
  });

  it("requires owner approval for requested additional GitHub App permissions", async () => {
    const handler = new ResolveAppAccessDecisionHandler(
      new InMemoryOrganizationAppAccessPolicyQueryAdapter([policyFixture()]),
    );

    const decision = await handler.resolveAppAccessDecision({
        kind: "github-app-installation",
        organizationId: "organization_test",
        scope: "github-app-installation",
        actorMembership: "member",
        requestedAdditionalPermissions: ["issues:write"],
        hasOwnerApproval: false,
    });
    expect(decision).toMatchObject({
      status: "denied",
      reason: "owner-approval-required",
    });
    expect(decision.policy.organizationId).toBe("organization_test");
  });

  it("defaults to permissive when no policy is configured", async () => {
    const handler = new ResolveAppAccessDecisionHandler(
      new InMemoryOrganizationAppAccessPolicyQueryAdapter([]),
    );

    const decision = await handler.resolveAppAccessDecision({
        kind: "github-app-installation",
        organizationId: "organization_unknown",
        scope: "github-app-installation",
        actorMembership: "outside-collaborator",
        requestedAdditionalPermissions: [],
        hasOwnerApproval: false,
    });
    expect(decision).toMatchObject({ status: "allowed" });
    expect(decision.policy.organizationId).toBe("organization_unknown");
  });
});
