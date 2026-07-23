import type {
  GetSelectedDashboardContextQuery,
  GetSelectedDashboardContextResult,
  GetSelectedDashboardContextUseCase,
} from "../ports/inbound/get-selected-dashboard-context.use-case";
import type { DashboardSelectionRepositoryPort } from "../ports/outbound/dashboard-selection.repository.port";

export class GetSelectedDashboardContextHandler
  implements GetSelectedDashboardContextUseCase
{
  private readonly selectionRepository: DashboardSelectionRepositoryPort;

  constructor(
    selectionRepository: DashboardSelectionRepositoryPort,
  ) {
    this.selectionRepository = selectionRepository;
  }

  async getSelectedDashboardContext(
    query: GetSelectedDashboardContextQuery,
  ): Promise<GetSelectedDashboardContextResult> {
    const context = await this.selectionRepository.findBySessionId(
      query.sessionId,
    );
    return context === null
      ? { status: "context-not-selected" }
      : { status: "found", context };
  }
}
