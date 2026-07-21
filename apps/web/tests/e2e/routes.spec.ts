import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "Your workspace is ready." },
  { path: "/accessibility", heading: "Accessibility" },
  { path: "/accept-invitation", heading: "Accept invitation" },
  { path: "/account", heading: "Account" },
  { path: "/dashboard", heading: "Dashboard" },
  { path: "/docs", heading: "Documentation" },
  { path: "/forgot-password", heading: "Forgot password" },
  { path: "/logout", heading: "Log out" },
  { path: "/notifications", heading: "Notifications" },
  { path: "/privacy", heading: "Privacy" },
  { path: "/projects", heading: "Projects" },
  { path: "/repositories", heading: "Repositories" },
  { path: "/reset-password", heading: "Reset password" },
  { path: "/search", heading: "Search" },
  { path: "/settings", heading: "Settings" },
  { path: "/sign-in", heading: "Sign in" },
  { path: "/sign-up", heading: "Create an account" },
  { path: "/terms", heading: "Terms" },
  { path: "/verify-email", heading: "Verify email" },
];

for (const route of routes) {
  test(`${route.path} renders its expected heading`, async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    const response = await page.goto(route.path);

    expect(response?.ok()).toBe(true);
    await expect(
      page.getByRole("heading", { level: 1, name: route.heading }),
    ).toBeVisible();
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}

test("public navigation reaches documentation and sign-in", async ({ page }) => {
  await page.goto("/docs");
  await page.getByRole("link", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible();
});

test("console navigation reaches repositories", async ({ page }) => {
  await page.goto("/dashboard");
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
