import { expect, test } from "@playwright/test";

test("robots policy exposes the sitemap and protects private routes", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(body).toContain("Allow: /docs");
  expect(body).toContain("Disallow: /dashboard");
  expect(body).toContain("Sitemap:");
});

test("sitemap contains only public foundation routes", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const body = await response.text();

  expect(response.ok()).toBe(true);
  expect(body).toContain("/docs");
  expect(body).toContain("/privacy");
  expect(body).not.toContain("/dashboard");
});

test("web manifest identifies the Support application", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  const manifest: unknown = await response.json();

  expect(response.ok()).toBe(true);
  expect(manifest).toMatchObject({
    display: "standalone",
    name: "Support",
    short_name: "Support",
    start_url: "/",
  });
});
