export interface MediaIdGeneratorPort {
  nextMediaId(): string;
  storageKey(mediaId: string): string;
}
