import { z } from "zod";

export const IntegrationEventMetadataSchema = z.strictObject({
  causationId: z.string().min(1).optional(),
  correlationId: z.string().min(1).optional(),
  id: z.string().min(1),
  occurredAt: z.iso.datetime({ offset: true }),
  schemaVersion: z.number().int().positive(),
  type: z.string().min(1),
});

export type IntegrationEventMetadata = z.infer<
  typeof IntegrationEventMetadataSchema
>;

export function createIntegrationEventSchema<
  PayloadSchema extends z.ZodType,
>(payloadSchema: PayloadSchema) {
  return IntegrationEventMetadataSchema.extend({
    payload: payloadSchema,
  });
}
