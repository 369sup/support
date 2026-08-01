import { describe, expect, it } from "vitest";

import { getAccountReferenceById } from "./src/modules/identity/accounts/server-api";
import { checkOrganizationContextEligibility } from "./src/modules/organizations/organization-memberships/server-api";
import { listOrganizationRoleAssignments } from "./src/modules/organizations/organization-roles/server-api";
import { resolveAccountTeamMemberships } from "./src/modules/organizations/organization-teams/server-api";
import { getOrganizationByLogin } from "./src/modules/organizations/organizations/server-api";
import { getRepositoryByOwnerAndName } from "./src/modules/repositories/repositories/server-api";
import { resolveEffectiveRepositoryPermission } from "./src/modules/repositories/repository-access/server-api";

describe("development scenario integrity", () => {
  it("keeps team, role, repository, and grant references in one owner scope", async () => {
    const [hubot, octocat, organization] = await Promise.all([
      getAccountReferenceById("account_hubot"),
      getAccountReferenceById("account_octocat"),
      getOrganizationByLogin("community-lab"),
    ]);
    expect(hubot.status).toBe("found");
    expect(octocat.status).toBe("found");
    expect(organization.status).toBe("found");
    if (
      hubot.status !== "found" ||
      octocat.status !== "found" ||
      organization.status !== "found"
    ) {
      throw new Error("The development account and organization seed is invalid.");
    }

    const eligibility = await checkOrganizationContextEligibility({
      accountId: hubot.account.accountId,
      organizationId: organization.organization.organizationId,
    });
    expect(eligibility.status).toBe("eligible");

    const memberships = await resolveAccountTeamMemberships({
      accountId: hubot.account.accountId,
      organizationId: organization.organization.organizationId,
    });
    expect(memberships).toHaveLength(1);
    expect(memberships[0]?.membership.teamId).toBe(
      "team_community_docs_ops",
    );
    expect(memberships[0]?.ancestorTeamIds).toEqual([
      "team_community_docs",
    ]);

    const assignments = await listOrganizationRoleAssignments({
      actorAccountId: octocat.account.accountId,
      organizationId: organization.organization.organizationId,
    });
    expect(assignments.status).toBe("found");
    if (assignments.status !== "found") {
      throw new Error("The seeded organization owner cannot inspect roles.");
    }
    expect(
      assignments.assignments.some(
        (assignment) =>
          assignment.roleKey === "moderator" &&
          assignment.subject.kind === "team" &&
          assignment.subject.teamId === "team_community_docs_ops",
      ),
    ).toBe(true);

    const repository = await getRepositoryByOwnerAndName(
      organization.organization.organizationId,
      "private-handbook",
    );
    expect(repository.status).toBe("found");
    if (repository.status !== "found") {
      throw new Error("The private repository seed is invalid.");
    }
    expect(repository.repository.owner).toEqual({
      kind: "organization",
      organizationId: organization.organization.organizationId,
      login: "community-lab",
    });

    const decision = await resolveEffectiveRepositoryPermission({
      actor: hubot.account,
      repository: repository.repository,
    });
    expect(decision.permission).toBe("read");
    expect(
      decision.sources.some(
        (source) =>
          source.kind === "team-grant" &&
          source.teamId === "team_community_docs" &&
          source.matchedTeamId === "team_community_docs_ops" &&
          source.isInherited,
      ),
    ).toBe(true);
    expect(
      decision.sources.some((source) => source.kind === "organization-role"),
    ).toBe(false);
  });
});
