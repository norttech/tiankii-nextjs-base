import { z } from "zod";

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(10)
    .describe("0 means no limit (fetch all matching records)"),
});

export type PaginationType = z.infer<typeof PaginationSchema>;
