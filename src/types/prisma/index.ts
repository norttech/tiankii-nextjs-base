/**
 * Extended Prisma types.
 *
 * Prisma v7 generates model types directly, so for base models you can
 * import them straight from the generated client:
 *
 * ```ts
 * import type { Customer, User } from "@prisma/client";
 * ```
 *
 * This file is for **composite/extended types** that include relations
 * or select specific fields beyond the base model:
 *
 * ```ts
 * import type { Customer, User } from "@prisma/client";
 *
 * export type UserWithCustomers = User & {
 *   customers: Customer[];
 * };
 * ```
 *
 * For more advanced payloads with nested includes, use `Prisma.XxxGetPayload`:
 *
 * ```ts
 * import type { Prisma } from "@prisma/client";
 *
 * export type DeepUser = Prisma.UserGetPayload<{
 *   include: { customers: { include: { invoices: true } } };
 * }>;
 * ```
 */

import type { Customer } from "@/types/customer";

// ─── Extended user types ──────────────────────────────────────────────────────

/** A user with their related customers loaded */
export interface UserWithCustomers {
  id: string;
  name: string;
  email: string;
  customers: Customer[];
}
