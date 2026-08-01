export type RequestSupabasePasswordResetResult = Readonly<{
  status: "requested";
}>;

export interface RequestSupabasePasswordResetUseCase {
  requestSupabasePasswordReset(input: {
    email: string;
    redirectTo: string;
  }): Promise<RequestSupabasePasswordResetResult>;
}
