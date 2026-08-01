import type { MediaObjectRepositoryPort } from "../../../application/ports/outbound/media-object.repository.port";
import type { MediaObject } from "../../../domain/media-object";

export interface InMemoryMediaObjectState {
  mediaById: Map<string, MediaObject>;
}

declare global {
  var __supportMediaObjectStateV1: InMemoryMediaObjectState | undefined;
}

function createState(): InMemoryMediaObjectState {
  return { mediaById: new Map() };
}

function getProcessState() {
  globalThis.__supportMediaObjectStateV1 ??= createState();
  return globalThis.__supportMediaObjectStateV1;
}

function clone(media: MediaObject): MediaObject {
  return { ...media, content: media.content.slice() };
}

export class InMemoryMediaObjectAdapter
  implements MediaObjectRepositoryPort
{
  private readonly state: InMemoryMediaObjectState;

  static createState() {
    return createState();
  }

  constructor(state: InMemoryMediaObjectState = getProcessState()) {
    this.state = state;
  }

  findById(mediaId: string) {
    const media = this.state.mediaById.get(mediaId);
    return Promise.resolve(media === undefined ? null : clone(media));
  }

  reset() {
    this.state.mediaById.clear();
  }

  save(media: MediaObject) {
    this.state.mediaById.set(media.mediaId, clone(media));
    return Promise.resolve();
  }
}
