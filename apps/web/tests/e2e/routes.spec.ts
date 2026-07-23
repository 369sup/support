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
];

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Sign in with mock account" }).click();
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
  test(`${route.path} renders after mock authentication`, async ({ page }) => {
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

test("invalid mock credentials remain on sign-in", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Password").fill("incorrect");
  await page.getByRole("button", { name: "Sign in with mock account" }).click();

  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "Incorrect mock username or password.",
  );
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("mock sign-in and sign-out complete the session flow", async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();

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
