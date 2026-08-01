import { redirect } from "next/navigation";
import type { AuthenticatedSessionReference } from "../../../contracts/authenticated-session-reference";

export function createRequiredCurrentSessionAdapter(
  getOptionalCurrentSession: () => Promise<AuthenticatedSessionReference | null>,
) {
  async function requireCurrentSession(): Promise<AuthenticatedSessionReference> {
    const session = await getOptionalCurrentSession();
    if (session === null) {
      redirect("/login");
    }
    return session;
  }

  return { getOptionalCurrentSession, requireCurrentSession };
}
