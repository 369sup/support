import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@support/observability", "@support/shadcn"],
};

export default nextConfig;
