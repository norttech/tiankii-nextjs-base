import { z } from "zod";

export const SearchSchema = z.object({
  search: z.string().optional(),
  isActive: z.union([z.boolean(), z.string().transform((val) => val === "true")]).optional(),
});

export type SearchType = z.infer<typeof SearchSchema>;
