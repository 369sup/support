export type UpdateSupabasePasswordResult =
  | Readonly<{ status: "changed" }>
  | Readonly<{ status: "service-unavailable" }>;

export interface UpdateSupabasePasswordUseCase {
  updateSupabasePassword(
    password: string,
  ): Promise<UpdateSupabasePasswordResult>;
}
