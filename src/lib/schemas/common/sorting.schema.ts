import { z } from "zod";

export const SortingSchema = z.object({
  sort: z
    .string()
    .optional()
    .default("-createdAt")
    .transform((val, ctx) => {
      if (!val) return [{ createdAt: "desc" as SortOrder }];

      const parts = val
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      return parts.map((part) => {
        let fieldName: string;
        let direction: SortOrder = "asc";

        if (part.includes(":") || part.includes("|")) {
          const separator = part.includes(":") ? ":" : "|";
          const [field, dir] = part.split(separator).map((s) => s.trim());

          if (!field) {
            ctx.addIssue({
              code: "custom",
              message: `Invalid sort format: '${part}'. Field name is missing.`,
            });
            return { createdAt: "desc" as SortOrder }; // fallback
          }

          fieldName = field;
          if (dir) direction = dir.toLowerCase() as SortOrder;
        } else if (part.startsWith("-") || part.startsWith("+")) {
          direction = part.startsWith("-") ? "desc" : "asc";
          fieldName = part.replace(/^[+-]/, "").trim();
        } else {
          fieldName = part;
        }

        if (direction !== "asc" && direction !== "desc") {
          ctx.addIssue({
            code: "custom",
            message: `Invalid sort direction for '${fieldName}': '${direction}'. Use 'asc' or 'desc'.`,
          });
          direction = "asc"; // fallback
        }

        return { [fieldName]: direction } as Record<string, SortOrder>;
      });
    }),
});

export type SortingType = z.infer<typeof SortingSchema>;
