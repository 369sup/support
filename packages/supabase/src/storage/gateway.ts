import { createClient } from "@supabase/supabase-js";

import {
  resolveSupabaseServerConfiguration,
  type SupabaseServerRuntimeConfiguration,
} from "../server-configuration";

export type SupabaseStorageFailure = Readonly<{
  code: string;
  status: number | null;
}>;

export type SupabaseStorageResult<T> =
  | Readonly<{ data: T; error: null }>
  | Readonly<{ data: null; error: SupabaseStorageFailure }>;

export type SupabaseStorageObjectReference = Readonly<{
  bucket: string;
  path: string;
}>;

export interface SupabaseStorageGateway {
  downloadObject: (
    reference: SupabaseStorageObjectReference,
  ) => Promise<SupabaseStorageResult<Uint8Array>>;
  removeObjects: (
    bucket: string,
    paths: readonly string[],
  ) => Promise<SupabaseStorageResult<null>>;
  uploadObject: (input: {
    bucket: string;
    content: Uint8Array;
    contentType: string;
    path: string;
    shouldUpsert?: boolean;
  }) => Promise<SupabaseStorageResult<SupabaseStorageObjectReference>>;
}

function failure<T>(
  code: string,
  status: number | null = null,
): SupabaseStorageResult<T> {
  return { data: null, error: { code, status } };
}

function normalizeSegment(value: string): string | null {
  const normalized = value.trim();
  if (
    normalized === "" ||
    normalized.startsWith("/") ||
    normalized.endsWith("/") ||
    normalized.includes("\\") ||
    normalized.split("/").some((segment) => segment === "..")
  ) {
    return null;
  }
  return normalized;
}

function mapStorageError(error: unknown): SupabaseStorageFailure {
  if (!isRecord(error)) {
    return { code: "storage-operation-failed", status: null };
  }
  const statusValue = error["statusCode"] ?? error["status"];
  let status: number | null = null;
  if (typeof statusValue === "number" && Number.isFinite(statusValue)) {
    status = statusValue;
  } else if (
    typeof statusValue === "string" &&
    /^\d+$/u.test(statusValue)
  ) {
    status = Number(statusValue);
  }
  return {
    code:
      typeof error["error"] === "string" &&
      error["error"].trim() !== ""
        ? error["error"]
        : "storage-operation-failed",
    status,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function createSupabaseStorageGateway(
  configurationInput: SupabaseServerRuntimeConfiguration,
): SupabaseStorageGateway {
  const configuration =
    resolveSupabaseServerConfiguration(configurationInput);
  const client = createClient(
    configuration.url,
    configuration.secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  return {
    downloadObject: async ({ bucket, path }) => {
      const normalizedBucket = normalizeSegment(bucket);
      const normalizedPath = normalizeSegment(path);
      if (normalizedBucket === null || normalizedPath === null) {
        return failure("invalid-storage-reference");
      }
      try {
        const { data, error } = await client.storage
          .from(normalizedBucket)
          .download(normalizedPath);
        if (error !== null) {
          return { data: null, error: mapStorageError(error) };
        }
        return {
          data: new Uint8Array(await data.arrayBuffer()),
          error: null,
        };
      } catch {
        return failure("storage-service-unavailable");
      }
    },
    removeObjects: async (bucket, paths) => {
      const normalizedBucket = normalizeSegment(bucket);
      const normalizedPaths = paths.flatMap((path) => {
        const normalizedPath = normalizeSegment(path);
        return normalizedPath === null ? [] : [normalizedPath];
      });
      if (
        normalizedBucket === null ||
        normalizedPaths.length === 0 ||
        normalizedPaths.length !== paths.length
      ) {
        return failure("invalid-storage-reference");
      }
      try {
        const { error } = await client.storage
          .from(normalizedBucket)
          .remove(normalizedPaths);
        return error === null
          ? { data: null, error: null }
          : { data: null, error: mapStorageError(error) };
      } catch {
        return failure("storage-service-unavailable");
      }
    },
    uploadObject: async ({
      bucket,
      content,
      contentType,
      path,
      shouldUpsert = false,
    }) => {
      const normalizedBucket = normalizeSegment(bucket);
      const normalizedPath = normalizeSegment(path);
      const normalizedContentType = contentType.trim();
      if (
        normalizedBucket === null ||
        normalizedPath === null ||
        normalizedContentType === ""
      ) {
        return failure("invalid-storage-object");
      }
      try {
        const body = Uint8Array.from(content).buffer;
        const { error } = await client.storage
          .from(normalizedBucket)
          .upload(normalizedPath, body, {
            contentType: normalizedContentType,
            upsert: shouldUpsert,
          });
        return error === null
          ? {
              data: {
                bucket: normalizedBucket,
                path: normalizedPath,
              },
              error: null,
            }
          : { data: null, error: mapStorageError(error) };
      } catch {
        return failure("storage-service-unavailable");
      }
    },
  };
}
