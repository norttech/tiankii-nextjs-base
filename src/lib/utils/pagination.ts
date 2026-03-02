import { NextResponse } from "next/server";

export function getPaginationParams(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const page_size = Math.max(
    1,
    Math.min(
      100,
      parseInt(
        searchParams.get("page_size") ||
          searchParams.get("per_page") ||
          searchParams.get("limit") ||
          "10",
      ),
    ),
  );
  const skip = (page - 1) * page_size;

  return { page, page_size, skip };
}

export function createPaginatedResponse<R, M = R>(
  records: R[],
  total: number,
  params: PaginationParams,
  req: Request,
  format?: (record: R) => M,
): PaginatedResponse<M> {
  const { page, page_size } = params;
  const total_pages = Math.ceil(total / page_size) || 1;

  const url = new URL(req.url);
  const baseUrl = `${url.origin}${url.pathname}`;

  const createLink = (p: number) => {
    const freshParams = new URLSearchParams(url.searchParams);
    freshParams.set("page", p.toString());
    freshParams.set("page_size", page_size.toString());
    return `${baseUrl}?${freshParams.toString()}`;
  };

  return {
    data: format ? records.map(format) : (records as unknown as M[]),
    pagination: {
      page,
      page_size,
      total_items: total,
      total_pages,
      has_next: page < total_pages,
      has_previous: page > 1,
    },
    links: {
      self: createLink(page),
      first: createLink(1),
      prev: page > 1 ? createLink(page - 1) : null,
      next: page < total_pages ? createLink(page + 1) : null,
      last: createLink(total_pages),
    },
  };
}

export function createPaginatedNextResponse<R, M = R>(
  records: R[],
  total: number,
  params: PaginationParams,
  req: Request,
  format?: (record: R) => M,
): NextResponse<PaginatedResponse<M>> {
  return NextResponse.json(createPaginatedResponse(records, total, params, req, format));
}
