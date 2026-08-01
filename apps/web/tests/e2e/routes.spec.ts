import { expect, test } from "@playwright/test";

const publicRoutes = [
  { path: "/", heading: "Where teams build trust together." },
  { path: "/accessibility", heading: "Accessibility" },
  { path: "/docs", heading: "Documentation" },
  { path: "/privacy", heading: "Privacy" },
  { path: "/login", heading: "Sign in to Support" },
  { path: "/signup", heading: "Create a personal account" },
  { path: "/terms", heading: "Terms" },
] as const;

const protectedRoutes = [
  "/account",
  "/dashboard",
  "/repositories",
  "/settings",
  "/settings/sessions",
] as const;

for (const route of publicRoutes) {
  test(route.path + " renders its expected heading", async ({ page }) => {
    const response = await page.goto(route.path);

    expect(response?.ok()).toBe(true);
    await expect(
      page.getByRole("heading", { level: 1, name: route.heading }),
    ).toBeVisible();
  });
}

test("home call to action reaches the canonical login page", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Sign in to Support", exact: true })
    .first()
    .click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in to Support" }),
  ).toBeVisible();
});

test("home layout is responsive and keyboard actions are supported", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const homeOverflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(homeOverflow.scrollWidth).toBeLessThanOrEqual(
    homeOverflow.clientWidth,
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const signInLink = page.getByRole("link", { name: "Sign in", exact: true });
  await signInLink.focus();
  await expect(signInLink).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/login$/);
});

test("home page exposes core sections and section navigation", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByText("Organizations", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Governance", { exact: true })).toBeVisible();
  await expect(
    page
      .locator("#collaboration")
      .getByRole("heading", { level: 2, name: "Stay aligned as work moves." }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Explore the platform", exact: true }).click();
  await expect(page).toHaveURL(/#product$/);

  await page.goto("/");
  await page.getByRole("link", { name: "Product", exact: true }).click();
  await expect(page).toHaveURL(/#product$/);
});

test("legacy sign-in URLs permanently redirect to canonical login URLs", async ({
  request,
}) => {
  const response = await request.get("/sign-in", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers()["location"]).toBe("/login");

  const addAccountResponse = await request.get("/sign-in?add=1", {
    maxRedirects: 0,
  });
  expect(addAccountResponse.status()).toBe(308);
  expect(addAccountResponse.headers()["location"]).toBe("/login?add=1");
});

test("development authentication handlers are not routable", async ({
  request,
}) => {
  const removedRoutes = [
    "/api/development/auth/sessions",
    "/api/development/auth/account-sessions/example/expire",
    "/api/development/auth/account-sessions/example/reauthenticate",
  ];

  for (const route of removedRoutes) {
    const response = await request.post(route, { maxRedirects: 0 });
    expect([307, 404, 405], route).toContain(response.status());
    if (response.status() === 307) {
      expect(response.headers()["location"], route).toBe("/login");
    }
  }
});

for (const route of protectedRoutes) {
  test(route + " redirects unauthenticated visitors to login", async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Sign in to Support" }),
    ).toBeVisible();
  });
}

test("unavailable authentication does not expose organization administration APIs", async ({
  context,
}) => {
  const response = await context.request.get(
    "/api/organizations/community-lab/teams",
  );

  expect(response.status()).toBe(404);
});

test("public navigation reaches login", async ({ page }) => {
  await page.goto("/docs");
  await page.getByRole("link", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/login$/);
});

test("unknown routes cannot bypass unauthenticated redirects", async ({ page }) => {
  await page.goto("/does-not-exist");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in to Support" }),
  ).toBeVisible();
});

test("an invalid legacy browser cookie cannot authenticate", async ({
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
  await expect(page).toHaveURL(/\/login$/);
});
