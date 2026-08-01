export type MediaObject = Readonly<{
  byteLength: number;
  checksum: string;
  classification: "public" | "private" | "sensitive";
  content: Uint8Array;
  contentType: string;
  createdAt: string;
  deletedAt: string | null;
  mediaId: string;
  state: "active" | "quarantined" | "deleted";
  storageKey: string;
  version: number;
}>;

export type MediaObjectReference = Readonly<
  Omit<MediaObject, "content" | "createdAt" | "deletedAt" | "state"> & {
    state: "active" | "quarantined";
  }
>;
