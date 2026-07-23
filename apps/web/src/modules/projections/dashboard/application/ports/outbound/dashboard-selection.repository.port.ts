import type { DashboardContextSnapshot } from "../../dashboard-snapshot";

export interface DashboardSelectionRepositoryPort {
  findBySessionId(
    sessionId: string,
  ): Promise<DashboardContextSnapshot | null>;
  save(
    sessionId: string,
    context: DashboardContextSnapshot,
  ): Promise<void>;
}
