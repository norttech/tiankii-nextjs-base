// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QueryCategorySchema, CreateCategorySchema } from "@/lib/schemas/category/category.schema";
import { getPaginationParams, createPaginatedNextResponse } from "@/lib/utils/pagination";
import { withGuards } from "@/middlewares/api/with-guards";

// GET /api/categories — List with pagination, sorting, and search
export const GET = withGuards({}, async ({ req }) => {
  const { page, pageSize, sort, search, ...filters } = QueryCategorySchema.parse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  const { skip, take } = getPaginationParams(req);

  const where: Prisma.CategoryWhereInput = {
    ...filters,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

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

// DELETE /api/categories — Batch Delete
export const DELETE = withGuards({}, async ({ req }) => {
  const body = await req.json();
  const { ids } = body;

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: "Invalid 'ids' provided" }, { status: 400 });
  }

  const result = await prisma.category.deleteMany({
    where: {
      id: { in: ids },
    },
  });

  return NextResponse.json({ success: true, count: result.count });
});
