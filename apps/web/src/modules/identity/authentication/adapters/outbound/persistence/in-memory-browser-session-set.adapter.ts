import type {
  BrowserSessionSetRepositoryPort,
  BrowserSessionSetSnapshot,
} from "../../../application/ports/outbound/browser-session-set.repository.port";

type BrowserSessionStore = Map<string, BrowserSessionSetSnapshot>;

declare global {
  var __supportBrowserSessionStoreV1: BrowserSessionStore | undefined;
}

function getProcessStore(): BrowserSessionStore {
  globalThis.__supportBrowserSessionStoreV1 ??= new Map();
  return globalThis.__supportBrowserSessionStoreV1;
}

function cloneSessionSet(
  sessionSet: BrowserSessionSetSnapshot,
): BrowserSessionSetSnapshot {
  return {
    ...sessionSet,
    sessions: sessionSet.sessions.map((session) => ({ ...session })),
  };
}

export class InMemoryBrowserSessionSetAdapter
  implements BrowserSessionSetRepositoryPort
{
  private readonly store: BrowserSessionStore;

  constructor(store = getProcessStore()) {
    this.store = store;
  }

  delete(browserToken: string): Promise<void> {
    this.store.delete(browserToken);
    return Promise.resolve();
  }

  findByToken(
    browserToken: string,
  ): Promise<BrowserSessionSetSnapshot | null> {
    const sessionSet = this.store.get(browserToken);
    return Promise.resolve(
      sessionSet === undefined ? null : cloneSessionSet(sessionSet),
    );
  }

  save(sessionSet: BrowserSessionSetSnapshot): Promise<void> {
    this.store.set(sessionSet.browserToken, cloneSessionSet(sessionSet));
    return Promise.resolve();
  }
}
