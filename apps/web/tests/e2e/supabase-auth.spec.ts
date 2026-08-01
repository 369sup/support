import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const requiredEnvironmentNames = [
  "DATABASE_URL",
  "SUPABASE_E2E_EMAIL",
  "SUPABASE_E2E_PASSWORD",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_URL",
] as const;

function readRequiredEnvironment(
  name: (typeof requiredEnvironmentNames)[number],
): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value === "") {
    throw new Error(
      `${name} is required for real Supabase Auth Playwright tests.`,
    );
  }
  return value;
}

test.beforeAll(() => {
  for (const name of requiredEnvironmentNames) {
    readRequiredEnvironment(name);
  }
  expect(process.env["SUPPORT_RUNTIME_MODE"]).toBe("postgres");
  expect(process.env["DATABASE_PROVIDER"]).toBe("supabase");
  expect(process.env["DATABASE_URL"]).toMatch(/^postgres(?:ql)?:\/\//u);
  expect(process.env["SUPABASE_URL"]).toMatch(/^https:\/\//u);
  expect(process.env["SUPABASE_PUBLISHABLE_KEY"]).toMatch(
    /^sb_publishable_/u,
  );
});

test("Supabase password login and logout use the SSR session cookie", async ({
  context,
  page,
}) => {
  const email = readRequiredEnvironment("SUPABASE_E2E_EMAIL");
  const password = readRequiredEnvironment("SUPABASE_E2E_PASSWORD");

  await page.goto("/login");
  await page.getByLabel("Username or email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await expect(page).toHaveURL(/\/dashboard$/u);
  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" }),
  ).toBeVisible();

  const projectReference = new URL(
    readRequiredEnvironment("SUPABASE_URL"),
  ).hostname.split(".")[0];
  const cookiePrefix = `sb-${projectReference}-auth-token`;
  expect(
    (await context.cookies()).some((cookie) =>
      cookie.name.startsWith(cookiePrefix),
    ),
  ).toBe(true);

  await page.goto("/logout");
  await expect(page).toHaveURL(/\/login$/u);
  expect(
    (await context.cookies()).some((cookie) =>
      cookie.name.startsWith(cookiePrefix),
    ),
  ).toBe(false);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/u);
});

test("invalid Supabase credentials cannot fall back to a local account", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByLabel("Username or email address")
    .fill(readRequiredEnvironment("SUPABASE_E2E_EMAIL"));
  await page.getByLabel("Password").fill("not-the-supabase-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "Incorrect username, email, or password.",
  );
  await expect(page).toHaveURL(/\/login$/u);
});

test("Supabase-provisioned accounts are durable in registration", async ({
  page,
}) => {
  const email = readRequiredEnvironment("SUPABASE_E2E_EMAIL");
  const password = readRequiredEnvironment("SUPABASE_E2E_PASSWORD");

  await page.goto("/signup");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Username").fill("e2e-login-ptdjinrj");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(
    /\/signup\?registration=username-conflict$/u,
  );
  await expect(page.locator("p[role='alert']")).toHaveText(
    "That username is already in use.",
  );
});
