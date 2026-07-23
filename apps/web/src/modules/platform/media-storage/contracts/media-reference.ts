export type MediaReference = Readonly<{
  byteLength: number;
  checksum: string;
  classification: "public" | "private" | "sensitive";
  contentType: string;
  mediaId: string;
  state: "active" | "quarantined";
  storageKey: string;
  version: number;
}>;
