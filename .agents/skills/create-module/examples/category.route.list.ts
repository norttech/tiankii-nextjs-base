// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QueryCategorySchema, CreateCategorySchema } from "@/lib/schemas/category/category.schema";
import { BatchDeleteSchema, BatchArchiveSchema } from "@/lib/schemas/common";
import { getPaginationParams, createPaginatedNextResponse } from "@/lib/utils/pagination";
import { withGuards } from "@/middlewares/api/with-guards";

// GET /api/categories — List with pagination, sorting, search, and archival filter
export const GET = withGuards({}, async ({ req }) => {
  const { page, pageSize, sort, search, isArchived, ...filters } =
    QueryCategorySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
  const { skip, take } = getPaginationParams(req);

  const where: Prisma.CategoryWhereInput = {
    ...filters,
    isArchived, // defaults to false via schema
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

// DELETE /api/categories — Batch Delete (permanent hard delete)
export const DELETE = withGuards({ schema: BatchDeleteSchema }, async ({ body }) => {
  const result = await prisma.category.deleteMany({
    where: {
      id: { in: body.ids },
    },
  });

  return NextResponse.json({ success: true, count: result.count });
});

// PATCH /api/categories — Batch Archive / Restore (status toggle)
export const PATCH = withGuards({ schema: BatchArchiveSchema }, async ({ user, body }) => {
  const archivalData = body.isArchived
    ? { isArchived: true, archivedAt: new Date(), archivedBy: user.id }
    : { isArchived: false, archivedAt: null, archivedBy: null };

  const result = await prisma.category.updateMany({
    where: { id: { in: body.ids } },
    data: {
      ...archivalData,
      updatedBy: user.id,
    },
  });

  return NextResponse.json({ success: true, count: result.count });
});
