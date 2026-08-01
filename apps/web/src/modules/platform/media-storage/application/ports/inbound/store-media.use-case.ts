import type { MediaObjectReference } from "../../../domain/media-object";

export type StoreMediaCommand = Readonly<{
  classification: "public" | "private" | "sensitive";
  content: Uint8Array;
  contentType: string;
}>;

export type StoreMediaResult = Readonly<{
  status: "stored";
  media: MediaObjectReference;
}>;

export interface StoreMediaUseCase {
  storeMedia(command: StoreMediaCommand): Promise<StoreMediaResult>;
}
