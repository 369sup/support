export type AnonymousPrincipal = Readonly<{
  kind: "anonymous";
}>;

export type AuthenticatedPrincipal = Readonly<{
  aal: "aal1" | "aal2" | null;
  accountId: string;
  kind: "authenticated";
  sessionId: string;
  supabaseUserId: string;
}>;

export type RequestPrincipal =
  | AnonymousPrincipal
  | AuthenticatedPrincipal;
