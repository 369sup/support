import type { RepositoryIdGeneratorPort } from "../../../application/ports/outbound/repository-id-generator.port";

declare global {
  var __supportRepositoryIdSequenceV1: number | undefined;
}

export class InMemoryRepositoryIdGeneratorAdapter
  implements RepositoryIdGeneratorPort
{
  nextRepositoryId(): string {
    globalThis.__supportRepositoryIdSequenceV1 =
      (globalThis.__supportRepositoryIdSequenceV1 ?? 0) + 1;
    return `repository_managed_${globalThis.__supportRepositoryIdSequenceV1}`;
  }
}
