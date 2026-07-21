import { z } from "zod";

export const ProblemDetailsSchema = z
  .object({
    detail: z.string().min(1).optional(),
    instance: z.string().min(1).optional(),
    status: z.number().int().min(400).max(599),
    title: z.string().min(1),
    type: z.string().min(1),
  })
  .catchall(z.unknown());

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;
