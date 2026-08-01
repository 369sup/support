export type SupabaseAuthRuntimeConfiguration = Readonly<{
  publishableKey: string;
  url: string;
}>;

const localAuthHosts = new Set(["127.0.0.1", "localhost"]);

function parseAuthUrl(value: string): URL {
  try {
    return new URL(value);
  } catch {
    throw new Error("Supabase Auth URL is invalid.");
  }
}

function assertAuthUrl(url: URL): void {
  const isLocalHttp =
    url.protocol === "http:" && localAuthHosts.has(url.hostname);
  if (url.protocol !== "https:" && !isLocalHttp) {
    throw new Error(
      "Supabase Auth URL must use HTTPS except for local development.",
    );
  }
  if (
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new Error("Supabase Auth URL contains unsupported components.");
  }
}

function assertPublishableKey(value: string): void {
  const normalized = value.trim();
  if (normalized === "") {
    throw new Error("Supabase publishable key is required.");
  }
  if (
    normalized.startsWith("sb_secret_") ||
    normalized.toLocaleLowerCase("en-US").includes("service_role")
  ) {
    throw new Error(
      "Supabase Auth requires a publishable key, not a privileged key.",
    );
  }
}

export function resolveSupabaseAuthConfiguration(
  configuration: SupabaseAuthRuntimeConfiguration,
): SupabaseAuthRuntimeConfiguration {
  const url = parseAuthUrl(configuration.url.trim());
  assertAuthUrl(url);
  assertPublishableKey(configuration.publishableKey);

  return {
    publishableKey: configuration.publishableKey.trim(),
    url: url.toString().replace(/\/$/u, ""),
  };
}
