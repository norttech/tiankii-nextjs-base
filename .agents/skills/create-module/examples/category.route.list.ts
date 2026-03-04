// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QueryCategorySchema, CreateCategorySchema } from "@/lib/schemas/category/category.schema";
import { getPaginationParams, createPaginatedNextResponse } from "@/lib/utils/pagination";
import { withGuards } from "@/middlewares/api/with-guards";

// GET /api/categories — List with pagination, sorting, and search
export const GET = withGuards({}, async ({ req }) => {
  const { page, pageSize, sort, ...filters } = QueryCategorySchema.parse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  const { skip, take } = getPaginationParams(req);

  const where = {
    ...filters,
  };

  const [data, total] = await prisma.$transaction([
    prisma.category.findMany({ where, skip, take, orderBy: sort }),
    prisma.category.count({ where }),
  ]);

  return createPaginatedNextResponse(data, total, { page, pageSize });
});

// POST /api/categories — Create
export const POST = withGuards({ schema: CreateCategorySchema }, async ({ user, body }) => {
  const category = await prisma.category.create({
    data: {
      ...body,
      createdBy: user.id,
    },
  });

  return NextResponse.json(category, { status: 201 });
});
