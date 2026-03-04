import { z } from "zod";

export const SearchSchema = z.object({});

export type SearchType = z.infer<typeof SearchSchema>;
