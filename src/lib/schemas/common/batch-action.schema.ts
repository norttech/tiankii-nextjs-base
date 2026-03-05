import { z } from "zod";

export const BatchActionSchema = z.object({
  ids: z.array(z.string()),
});

export type BatchAction = z.infer<typeof BatchActionSchema>;
