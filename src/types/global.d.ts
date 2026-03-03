import type { Session } from "next-auth";

export {};

declare global {
  // ─── Auth types ─────────────────────────────────────────────────────────────
  type SessionUser = NonNullable<Session["user"]>;

  // ─── Primitive aliases ──────────────────────────────────────────────────────
  /** String UUID/ID — makes intent explicit in function signatures */
  type ID = string;

  /** ISO 8601 date-time string, e.g. "2024-01-15T10:30:00Z" */
  type ISODate = string;

  // ─── Nullability helpers ────────────────────────────────────────────────────
  /** T | null */
  type Nullable<T> = T | null;

  /** T | undefined */
  type Optional<T> = T | undefined;

  /** T | null | undefined */
  type Maybe<T> = T | null | undefined;

  // ─── Object shape helpers ───────────────────────────────────────────────────
  /** Adds `id: string` to any object */
  type WithId<T> = T & { id: ID };

  /** Adds standard createdAt / updatedAt timestamps */
  type WithTimestamps<T> = T & {
    createdAt: ISODate;
    updatedAt: ISODate;
  };

  /** Combines WithId and WithTimestamps */
  type BaseRecord<T> = WithId<WithTimestamps<T>>;

  /** Makes specific keys of T required (rest stay as-is) */
  type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

  /** Makes all keys optional except the specified ones */
  type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>;

  // ─── Pagination types ───────────────────────────────────────────────────────
  interface PaginationParams {
    page: number;
    pageSize: number;
  }

  interface PaginationMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }

  interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
  }

  // ─── List / Query helpers ───────────────────────────────────────────────────
  type SortOrder = "asc" | "desc";

  interface SearchParams {
    search?: string;
  }

  // ─── Form / UI helpers ──────────────────────────────────────────────────────
  /** Generic option for <select> or combobox components */
  interface SelectOption<V = string> {
    label: string;
    value: V;
    disabled?: boolean;
  }

  // ─── Async state ────────────────────────────────────────────────────────────
  type AsyncStatus = "idle" | "loading" | "success" | "error";

  interface AsyncState<T> {
    data: Maybe<T>;
    status: AsyncStatus;
    error: Maybe<string>;
  }
}
