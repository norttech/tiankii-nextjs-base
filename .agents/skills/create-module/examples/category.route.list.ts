// @ts-nocheck
/* eslint-disable */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { QueryCategorySchema, CreateCategorySchema } from "@/lib/schemas/category/category.schema";
import { getPaginationParams, createPaginatedNextResponse } from "@/lib/utils/pagination";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = QueryCategorySchema.parse(Object.fromEntries(searchParams));

    // Pagination: validated by Zod via PaginationSchema, Prisma-ready skip/take included
    const { page, pageSize, skip, take } = getPaginationParams(request);

    const where = {
      isActive: true,
      deletedAt: null,
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: params.sort,
      }),
      prisma.category.count({ where }),
    ]);

    return createPaginatedNextResponse(data, total, { page, pageSize });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = CreateCategorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        ...payload,
        createdBy: "system-user-id", // In actual app, get from session
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
}
