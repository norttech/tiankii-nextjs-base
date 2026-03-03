import { NextResponse } from "next/server";
import { PaginationSchema } from "@/lib/schemas/common/pagination.schema";

/** Parsed pagination values + Prisma-ready skip/take derived from URL searchParams */
export type PaginationArgs = ReturnType<typeof getPaginationParams>;

export function getPaginationParams(req: Request) {
  const { searchParams } = new URL(req.url);

  // Delegate all validation, coercion, and defaults to Zod
  const { page, pageSize } = PaginationSchema.parse(Object.fromEntries(searchParams));

  // pageSize = 0 → fetch all (pass undefined to Prisma skip/take)
  const skip = pageSize > 0 ? (page - 1) * pageSize : undefined;
  const take = pageSize > 0 ? pageSize : undefined;

  return { page, pageSize, skip, take };
}

export function createPaginatedResponse<R, M = R>(
  records: R[],
  total: number,
  params: PaginationParams,
  format?: (record: R) => M,
): PaginatedResponse<M> {
  const { page, pageSize } = params;
  const totalPages = pageSize > 0 && total > 0 ? Math.ceil(total / pageSize) : 0;

  return {
    data: format ? records.map(format) : (records as unknown as M[]),
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages,
      hasNextPage: pageSize > 0 && page < totalPages,
      hasPrevPage: pageSize > 0 && page > 1,
    },
  };
}

export function createPaginatedNextResponse<R, M = R>(
  records: R[],
  total: number,
  params: PaginationParams,
  format?: (record: R) => M,
): NextResponse<PaginatedResponse<M>> {
  return NextResponse.json(createPaginatedResponse(records, total, params, format));
}
