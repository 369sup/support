import { loadEnvConfig } from "@next/env";
import { resolve } from "node:path";
import type { NextConfig } from "next";

const repositoryRoot = resolve(process.cwd(), "../..");
const isDevelopment = process.env["NODE_ENV"] === "development";
loadEnvConfig(repositoryRoot, isDevelopment);

const nextConfig: NextConfig = {
  transpilePackages: ["@support/observability", "@support/shadcn"],
  typedRoutes: true,
};

// Exception: Next.js requires its configuration module to use a default export.
// Scope: this export is limited to the framework-owned next.config.ts boundary.
// Impact: application symbols remain named; only framework configuration differs.
// Alternatives: Next.js does not discover an equivalent named configuration export.
// Verification: the web typecheck and production build load this configuration.
export default nextConfig;
