export type SupabaseServerRuntimeConfiguration = Readonly<{
  secretKey: string;
  url: string;
}>;

const localHosts = new Set(["127.0.0.1", "localhost"]);

function parseUrl(value: string): URL {
  try {
    return new URL(value);
  } catch {
    throw new Error("Supabase server URL is invalid.");
  }
}

function assertUrl(url: URL): void {
  const isLocalHttp =
    url.protocol === "http:" && localHosts.has(url.hostname);
  if (url.protocol !== "https:" && !isLocalHttp) {
    throw new Error(
      "Supabase server URL must use HTTPS except for local development.",
    );
  }
  if (
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new Error("Supabase server URL contains unsupported components.");
  }
}

function assertSecretKey(value: string): void {
  const normalized = value.trim();
  if (normalized === "") {
    throw new Error("Supabase server secret key is required.");
  }
  if (normalized.startsWith("sb_publishable_")) {
    throw new Error(
      "Supabase server operations require a secret key, not a publishable key.",
    );
  }
}

export function resolveSupabaseServerConfiguration(
  configuration: SupabaseServerRuntimeConfiguration,
): SupabaseServerRuntimeConfiguration {
  const url = parseUrl(configuration.url.trim());
  assertUrl(url);
  assertSecretKey(configuration.secretKey);
  return {
    secretKey: configuration.secretKey.trim(),
    url: url.toString().replace(/\/$/u, ""),
  };
}
