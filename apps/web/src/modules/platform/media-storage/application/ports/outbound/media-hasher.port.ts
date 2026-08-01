export interface MediaHasherPort {
  checksum(content: Uint8Array): string;
}
