import { beforeEach, describe, expect, it, vi } from "vitest";

const doubles = vi.hoisted(() => {
  const deleteUser = vi.fn();
  const download = vi.fn();
  const remove = vi.fn();
  const upload = vi.fn();
  const from = vi.fn(() => ({ download, remove, upload }));
  const createClient = vi.fn(() => ({
    auth: { admin: { deleteUser } },
    storage: { from },
  }));
  return { createClient, deleteUser, download, from, remove, upload };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: doubles.createClient,
}));

import { createSupabaseAuthAdminGateway } from "../src/auth/admin-gateway";
import { createSupabaseStorageGateway } from "../src/storage/gateway";

const configuration = {
  secretKey: "server-only-secret",
  url: "https://support.supabase.co",
} as const;

describe("Supabase server-only gateways", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes an Auth user without exposing raw provider results", async () => {
    doubles.deleteUser.mockResolvedValue({ data: {}, error: null });

    const gateway = createSupabaseAuthAdminGateway(configuration);

    await expect(gateway.deleteUser(" user-id ")).resolves.toEqual({
      data: null,
      error: null,
    });
    expect(doubles.deleteUser).toHaveBeenCalledWith("user-id");
  });

  it("normalizes Auth admin validation and provider failures", async () => {
    doubles.deleteUser.mockResolvedValue({
      data: null,
      error: { code: "user_not_found", status: 404 },
    });
    const gateway = createSupabaseAuthAdminGateway(configuration);

    await expect(gateway.deleteUser(" ")).resolves.toEqual({
      data: null,
      error: { code: "invalid-user-id", status: null },
    });
    await expect(gateway.deleteUser("missing")).resolves.toEqual({
      data: null,
      error: { code: "user_not_found", status: 404 },
    });
  });

  it("uploads, downloads, and removes private storage objects", async () => {
    doubles.upload.mockResolvedValue({ data: {}, error: null });
    doubles.download.mockResolvedValue({
      data: new Blob([Uint8Array.from([1, 2, 3])]),
      error: null,
    });
    doubles.remove.mockResolvedValue({ data: [], error: null });
    const gateway = createSupabaseStorageGateway(configuration);

    await expect(
      gateway.uploadObject({
        bucket: "support-media",
        content: Uint8Array.from([1, 2, 3]),
        contentType: "image/png",
        path: "accounts/account-1/avatar.png",
      }),
    ).resolves.toEqual({
      data: {
        bucket: "support-media",
        path: "accounts/account-1/avatar.png",
      },
      error: null,
    });
    await expect(
      gateway.downloadObject({
        bucket: "support-media",
        path: "accounts/account-1/avatar.png",
      }),
    ).resolves.toEqual({
      data: Uint8Array.from([1, 2, 3]),
      error: null,
    });
    await expect(
      gateway.removeObjects("support-media", [
        "accounts/account-1/avatar.png",
      ]),
    ).resolves.toEqual({ data: null, error: null });
  });

  it("rejects unsafe storage references before calling Supabase", async () => {
    const gateway = createSupabaseStorageGateway(configuration);

    await expect(
      gateway.downloadObject({
        bucket: "support-media",
        path: "../private.txt",
      }),
    ).resolves.toEqual({
      data: null,
      error: { code: "invalid-storage-reference", status: null },
    });
    expect(doubles.from).not.toHaveBeenCalled();
  });
});
