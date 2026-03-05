import { z } from "zod";

export const BatchActionSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID is required"),
});

export const BatchDeleteSchema = BatchActionSchema;

export const BatchArchiveSchema = BatchActionSchema.extend({
  isArchived: z.boolean(),
});

export type BatchAction = z.infer<typeof BatchActionSchema>;
export type BatchDelete = z.infer<typeof BatchDeleteSchema>;
export type BatchArchive = z.infer<typeof BatchArchiveSchema>;
