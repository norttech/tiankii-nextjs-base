/**
 * Customer domain types.
 *
 * When Prisma models are available, replace this interface with a
 * direct import from the generated client:
 *
 * ```ts
 * export type { Customer } from "@prisma/client";
 * ```
 *
 * Prisma v7 generates model types directly — use them as the base,
 * and extend in `types/prisma/` if you need relations (e.g. UserWithCustomers).
 */
export interface Customer {
  id: string;
  userId: string;
  name: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
}
