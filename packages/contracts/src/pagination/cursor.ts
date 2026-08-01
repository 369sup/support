import { z } from "zod";

export const CursorPaginationRequestSchema = z.strictObject({
  cursor: z.string().min(1).optional(),
  limit: z.number().int().positive(),
});

export const CursorPageInfoSchema = z.discriminatedUnion("hasNextPage", [
  z.strictObject({
    endCursor: z.string().min(1),
    hasNextPage: z.literal(true),
  }),
  z.strictObject({
    endCursor: z.string().min(1).nullable(),
    hasNextPage: z.literal(false),
  }),
]);

export type CursorPaginationRequest = z.infer<
  typeof CursorPaginationRequestSchema
>;
export type CursorPageInfo = z.infer<typeof CursorPageInfoSchema>;
