import type { DashboardContextSnapshot } from "../../../application/dashboard-snapshot";
import type { DashboardSelectionRepositoryPort } from "../../../application/ports/outbound/dashboard-selection.repository.port";

type DashboardSelectionStore = Map<string, DashboardContextSnapshot>;

declare global {
  var __supportDashboardSelectionStoreV1:
    | DashboardSelectionStore
    | undefined;
}

function getProcessStore(): DashboardSelectionStore {
  globalThis.__supportDashboardSelectionStoreV1 ??= new Map();
  return globalThis.__supportDashboardSelectionStoreV1;
}

export class InMemoryDashboardSelectionAdapter
  implements DashboardSelectionRepositoryPort
{
  private readonly store: DashboardSelectionStore;

  constructor(store = getProcessStore()) {
    this.store = store;
  }

  findBySessionId(
    sessionId: string,
  ): Promise<DashboardContextSnapshot | null> {
    return Promise.resolve(this.store.get(sessionId) ?? null);
  }

  save(
    sessionId: string,
    context: DashboardContextSnapshot,
  ): Promise<void> {
    this.store.set(sessionId, context);
    return Promise.resolve();
  }
}
