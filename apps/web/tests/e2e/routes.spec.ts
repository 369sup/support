import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  { path: "/", heading: "Your workspace is ready." },
  { path: "/accessibility", heading: "Accessibility" },
  { path: "/accept-invitation", heading: "Accept invitation" },
  { path: "/docs", heading: "Documentation" },
  { path: "/forgot-password", heading: "Forgot password" },
  { path: "/logout", heading: "Log out" },
  { path: "/privacy", heading: "Privacy" },
  { path: "/reset-password", heading: "Reset password" },
  { path: "/search", heading: "Search" },
  { path: "/sign-in", heading: "Sign in" },
  { path: "/sign-up", heading: "Create an account" },
  { path: "/terms", heading: "Terms" },
  { path: "/verify-email", heading: "Verify email" },
];

const consoleRoutes = [
  { path: "/account", heading: "Account" },
  { path: "/dashboard", heading: "Dashboard" },
  { path: "/notifications", heading: "Notifications" },
  { path: "/projects", heading: "Projects" },
  { path: "/repositories", heading: "Repositories" },
  { path: "/settings", heading: "Settings" },
  {
    path: "/organizations/community-lab/settings/teams",
    heading: "Organization teams",
  },
  {
    path: "/organizations/community-lab/settings/roles",
    heading: "Organization roles",
  },
  {
    path: "/organizations/community-lab/settings/repository-access/private-handbook",
    heading: "Repository team access",
  },
];

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function signInAs(page: Page, username: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Username").fill(username);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

for (const route of publicRoutes) {
  test(`${route.path} renders its expected heading`, async ({ page }) => {
    const response = await page.goto(route.path);

    expect(response?.ok()).toBe(true);
    await expect(
      page.getByRole("heading", { level: 1, name: route.heading }),
    ).toBeVisible();
  });
}

for (const route of consoleRoutes) {
  test(`${route.path} renders after authentication`, async ({ page }) => {
    await signIn(page);
    await page.goto(route.path);

    await expect(
      page.getByRole("heading", { level: 1, name: route.heading }),
    ).toBeVisible();
  });
}

test("unauthenticated console navigation redirects to sign-in", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible();
});

test("invalid development credentials remain on sign-in", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Password").fill("incorrect");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "Incorrect development username or password.",
  );
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("organization administration APIs require authentication and same origin", async ({
  context,
  page,
}) => {
  const unauthenticated = await context.request.get(
    "/api/organizations/community-lab/teams",
  );
  expect(unauthenticated.status()).toBe(401);

  await signIn(page);
  const crossOrigin = await context.request.post(
    "/api/organizations/community-lab/teams",
    {
      data: {
        name: "Cross origin",
        slug: "cross-origin",
        description: "",
        visibility: "visible",
      },
      headers: { origin: "https://invalid.example" },
    },
  );
  expect(crossOrigin.status()).toBe(403);
});

test("sign-in uses an HttpOnly cookie and sign-out-all completes the flow", async ({
  context,
  page,
}) => {
  await signIn(page);
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
  const sessionCookie = (await context.cookies()).find(
    (cookie) => cookie.name === "support.browser-session",
  );
  expect(sessionCookie).toMatchObject({
    httpOnly: true,
    sameSite: "Lax",
  });
  await page.getByLabel("Account menu for @octocat").click();
  await page.getByRole("button", { name: "Sign out all" }).click();

  await expect(page).toHaveURL(/\/sign-in$/);
});

test("public navigation reaches documentation and sign-in", async ({ page }) => {
  await page.goto("/docs");
  await page.getByRole("link", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/sign-in$/);
});

test("console navigation reaches repositories", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Repositories" }).click();

  await expect(page).toHaveURL(/\/repositories$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Repositories" }),
  ).toBeVisible();
});

test("unknown routes render the application not-found page", async ({ page }) => {
  const response = await page.goto("/does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("account, Dashboard context, enterprise role, and repository access integrate", async ({
  page,
}) => {
  await signIn(page);

  const contextSwitcher = page.getByLabel("Dashboard context");
  await expect(contextSwitcher).toContainText("Community Lab");
  await expect(contextSwitcher).not.toContainText("ACME Enterprise");
  await contextSwitcher.selectOption({
    label: "Community Lab",
  });
  await expect(page.getByText("community-lab/docs")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Dashboard context")).toHaveValue(
    "organization:organization_community_lab",
  );
  await page.getByRole("link", { name: "Repositories" }).click();
  await expect(page).toHaveURL(/\/repositories$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByLabel("Dashboard context")).toHaveValue(
    "organization:organization_community_lab",
  );
  await page.goForward();
  await expect(page).toHaveURL(/\/repositories$/);
  await page.goBack();
  await expect(page.getByText("community-lab/docs")).toBeVisible();

  await page.getByLabel("Account menu for @octocat").click();
  await page.getByRole("link", { name: "Add account" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Add account" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByLabel("Account menu for @carol_ACME")).toBeVisible();

  await expect(page.getByLabel("Dashboard context")).toContainText(
    "ACME Platform",
  );
  await page.getByLabel("Dashboard context").selectOption({
    label: "ACME Platform",
  });
  await expect(page.getByText("acme-platform/internal-tools")).toBeVisible();
  await expect(page.getByText("read", { exact: true })).toBeVisible();

  await page.getByLabel("Account menu for @carol_ACME").click();
  await page
    .getByRole("link", { name: "Enterprise administration" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "ACME Enterprise" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "ACME Platform" }),
  ).toBeVisible();

  await page.getByRole("button", { name: /@octocat/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByLabel("Dashboard context")).toHaveValue(
    "organization:organization_community_lab",
  );
  await expect(page.getByText("community-lab/docs")).toBeVisible();
  await expect(page.getByLabel("Dashboard context")).not.toContainText(
    "ACME Platform",
  );
});

test("pending membership is not a selectable Dashboard context", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.getByLabel("Username").fill("bob");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByLabel("Dashboard context")).not.toContainText(
    "ACME Support",
  );
});

test("a child team member receives an inherited repository grant", async ({
  page,
}) => {
  await signInAs(page, "hubot");
  await page.getByLabel("Dashboard context").selectOption({
    label: "Community Lab",
  });

  const privateRepository = page
    .getByRole("listitem")
    .filter({ hasText: "community-lab/private-handbook" });
  await expect(privateRepository).toBeVisible();
  await expect(
    privateRepository.getByText("read", { exact: true }),
  ).toBeVisible();
});

test("team and role administration preserve inherited access boundaries", async ({
  page,
}) => {
  await signIn(page);
  await page.getByLabel("Dashboard context").selectOption({
    label: "Community Lab",
  });
  await expect(page.getByRole("link", { name: "Teams" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Roles" })).toBeVisible();

  const inheritedRevoke = await page.evaluate(async () => {
    const response = await fetch(
      "/api/organizations/community-lab/repositories/private-handbook/teams/docs-ops",
      { method: "DELETE" },
    );
    const payload: unknown = await response.json();
    return {
      httpStatus: response.status,
      status:
        payload !== null &&
        typeof payload === "object" &&
        "status" in payload &&
        typeof payload.status === "string"
          ? payload.status
          : null,
    };
  });
  expect(inheritedRevoke).toEqual({
    httpStatus: 409,
    status: "inherited-access-cannot-be-removed",
  });

  const assignmentId = await page.evaluate(async () => {
    const response = await fetch(
      "/api/organizations/community-lab/roles/assignments",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          roleKey: "all-repository-read",
          subjectKind: "account",
          subjectIdentifier: "account_hubot",
        }),
      },
    );
    const payload: unknown = await response.json();
    if (
      response.status !== 201 ||
      payload === null ||
      typeof payload !== "object" ||
      !("assignment" in payload) ||
      payload.assignment === null ||
      typeof payload.assignment !== "object" ||
      !("assignmentId" in payload.assignment) ||
      typeof payload.assignment.assignmentId !== "string"
    ) {
      return null;
    }
    return payload.assignment.assignmentId;
  });
  expect(assignmentId).not.toBeNull();
  if (assignmentId === null) {
    throw new Error("Role assignment was not created.");
  }
  const revokeStatus = await page.evaluate(async (id) => {
    const response = await fetch(
      `/api/organizations/community-lab/roles/assignments/${id}`,
      { method: "DELETE" },
    );
    return response.status;
  }, assignmentId);
  expect(revokeStatus).toBe(200);
});

test("secret teams and pending members are not disclosed or accepted", async ({
  page,
}) => {
  await signInAs(page, "carol_ACME");
  const secretTeamStatus = await page.evaluate(async () => {
    const response = await fetch(
      "/api/organizations/community-lab/teams/private-planning",
    );
    return response.status;
  });
  expect(secretTeamStatus).toBe(404);

  await page.getByLabel("Account menu for @carol_ACME").click();
  await page.getByRole("button", { name: "Sign out all" }).click();
  await signIn(page);
  const pendingMemberStatus = await page.evaluate(async () => {
    const response = await fetch(
      "/api/organizations/community-lab/teams/docs/members/bob",
      { method: "PUT" },
    );
    return response.status;
  });
  expect(pendingMemberStatus).toBe(400);
});

test("an account session can be removed without exposing its account", async ({
  page,
}) => {
  await signIn(page);
  await page.getByLabel("Account menu for @octocat").click();
  await page.getByRole("link", { name: "Add account" }).click();
  await page.getByRole("button", { name: "Add account" }).click();
  await expect(page.getByLabel("Account menu for @carol_ACME")).toBeVisible();

  await page.getByLabel("Account menu for @carol_ACME").click();
  await page
    .getByRole("button", { name: "Remove octocat session" })
    .click();
  await page.getByLabel("Account menu for @carol_ACME").click();
  await expect(
    page.getByRole("button", { name: /@octocat/ }),
  ).toHaveCount(0);
});

test("a process-invalidated opaque cookie safely redirects to sign-in", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "support.browser-session",
      value: "invalidated-browser-session",
      url: "http://127.0.0.1:3100",
    },
  ]);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("expired managed session requires reauthentication and keeps active account", async ({
  page,
}) => {
  await signIn(page);
  await page.getByLabel("Account menu for @octocat").click();
  await page.getByRole("link", { name: "Add account" }).click();
  await page.getByRole("button", { name: "Add account" }).click();

  const carolSessionId = await page.evaluate(async () => {
    const response = await fetch("/api/auth/account-sessions");
    const payload: unknown = await response.json();
    if (
      payload === null ||
      typeof payload !== "object" ||
      !("sessions" in payload) ||
      !Array.isArray(payload.sessions)
    ) {
      return null;
    }
    const sessions: unknown[] = payload.sessions;
    for (const session of sessions) {
      if (
        session !== null &&
        typeof session === "object" &&
        "sessionId" in session &&
        typeof session.sessionId === "string" &&
        "account" in session &&
        session.account !== null &&
        typeof session.account === "object" &&
        "username" in session.account &&
        session.account.username === "carol_ACME"
      ) {
        return session.sessionId;
      }
    }
    return null;
  });
  expect(carolSessionId).not.toBeNull();

  await page.evaluate(async (sessionId) => {
    await fetch(
      `/api/development/auth/account-sessions/${sessionId}/expire`,
      { method: "POST" },
    );
  }, carolSessionId);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Account menu for @octocat").click();
  const expiredManagedSession = page.getByRole("button", {
    name: /@carol_ACME/,
  });
  await expect(expiredManagedSession).toBeDisabled();
  await expect(expiredManagedSession).toContainText(
    "Reauthentication required",
  );
  const activationStatus = await page.evaluate(async (sessionId) => {
    const response = await fetch(
      `/api/auth/account-sessions/${sessionId}/activate`,
      { method: "POST" },
    );
    const payload: unknown = await response.json();
    let status: string | null = null;
    if (
      payload !== null &&
      typeof payload === "object" &&
      "status" in payload &&
      typeof payload.status === "string"
    ) {
      status = payload.status;
    }
    return {
      httpStatus: response.status,
      status,
    };
  }, carolSessionId);
  expect(activationStatus).toEqual({
    httpStatus: 409,
    status: "reauthentication-required",
  });
  await expect(page.getByLabel("Account menu for @octocat")).toBeVisible();
});
