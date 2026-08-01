import { describe, expect, it } from "vitest";

import { RestoreLastValidDashboardContextHandler } from "../application/commands/restore-last-valid-dashboard-context.handler";
import type { DashboardContextSnapshot } from "../application/dashboard-snapshot";

describe("Dashboard context restoration", () => {
  it("persists personal fallback when stored organization is no longer eligible", async () => {
    let selected: DashboardContextSnapshot | null = {
      kind: "organization",
      organizationId: "organization_removed",
      login: "removed",
      displayName: "Removed",
      relationship: "member",
    };
    const handler = new RestoreLastValidDashboardContextHandler(
      {
        findBySessionId: () => Promise.resolve(selected),
        save: (_sessionId, context) => {
          selected = context;
          return Promise.resolve();
        },
      },
      {
        getActiveOrganizationMembership: () => Promise.resolve(null),
        getOrganization: () => Promise.resolve(null),
        listActiveOrganizationMemberships: () => Promise.resolve([]),
        listActiveRepositories: () => Promise.resolve([]),
        resolveRepositoryPermission: () =>
          Promise.resolve({ isAllowed: false, permission: null }),
      },
    );

    await expect(
      handler.restoreLastValidDashboardContext({
        actor: {
          sessionId: "session",
          account: {
            accountId: "account_octocat",
            username: "octocat",
            displayName: "The Octocat",
            lifecycleState: "active",
          },
        },
      }),
    ).resolves.toMatchObject({
      status: "fallback-selected",
      context: { kind: "personal", accountId: "account_octocat" },
    });
    expect(selected).toMatchObject({
      kind: "personal",
      accountId: "account_octocat",
    });
  });
});
