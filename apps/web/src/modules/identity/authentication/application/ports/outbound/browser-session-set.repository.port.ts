export type AccountSessionSnapshot = Readonly<{
  sessionId: string;
  accountId: string;
  status: "active" | "expired" | "revoked";
  authenticatedAt: string;
  expiresAt: string | null;
}>;

export type BrowserSessionSetSnapshot = Readonly<{
  browserToken: string;
  activeSessionId: string | null;
  sessions: readonly AccountSessionSnapshot[];
}>;

export interface BrowserSessionSetRepositoryPort {
  delete(browserToken: string): Promise<void>;
  findByToken(browserToken: string): Promise<BrowserSessionSetSnapshot | null>;
  save(sessionSet: BrowserSessionSetSnapshot): Promise<void>;
}
