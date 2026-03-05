// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { z } from "zod";
import { QueryBaseSchema } from "@/lib/schemas/common";

// ── Base Schema (all persistent fields) ────────────────────────────────────
export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  // Status fields
  isArchived: z.boolean().default(false),
  archivedAt: z.coerce.date().optional().nullable(),
  archivedBy: z.string().optional().nullable(),
});

// ── Create (omit system-managed fields) ────────────────────────────────────
export const CreateCategorySchema = CategorySchema.omit({
  id: true,
  isArchived: true,
  archivedAt: true,
  archivedBy: true,
});

// ── Update (partial — allows isArchived toggle, omits system-managed audit) ──
export const UpdateCategorySchema = CategorySchema.partial().omit({
  id: true,
  archivedAt: true,
  archivedBy: true,
});

// ── Query (extends base with module-specific filters) ──────────────────────
export const QueryCategorySchema = QueryBaseSchema.extend({
  name: z.string().optional(),
  color: z.string().optional(),
  isArchived: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional()
    .default("false"),
});

// ── Inferred Types ─────────────────────────────────────────────────────────
export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type QueryCategory = z.infer<typeof QueryCategorySchema>;
