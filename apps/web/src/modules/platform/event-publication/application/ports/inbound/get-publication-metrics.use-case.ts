export type PublicationMetrics = Readonly<{
  attempts: number;
  deadLetters: number;
  deliveredAttempts: number;
  failedAttempts: number;
  oldestPendingLagMilliseconds: number | null;
  receipts: number;
  retries: number;
}>;

export type GetPublicationMetricsResult = Readonly<{
  status: "found";
  metrics: PublicationMetrics;
}>;

export interface GetPublicationMetricsUseCase {
  getPublicationMetrics(): Promise<GetPublicationMetricsResult>;
}
