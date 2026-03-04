// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { z } from "zod";
import { QueryBaseSchema } from "@/lib/schemas/common";

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

export const CreateCategorySchema = CategorySchema.omit({
  id: true,
});

export const UpdateCategorySchema = CategorySchema.partial().omit({
  id: true,
});


export const QueryCategorySchema = QueryBaseSchema.extend({
  name: z.string().optional(),
  color: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type QueryCategory = z.infer<typeof QueryCategorySchema>;
