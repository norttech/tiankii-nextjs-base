// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateCategorySchema } from "@/lib/schemas/category/category.schema";
import { withGuards } from "@/middlewares/api/with-guards";
import { NotFoundError } from "@/lib/utils/error-handler";

// GET /api/categories/[id] — Read single record
export const GET = withGuards({}, async ({ user }, ctx: RouteContext<"/api/categories/[id]">) => {
  const { id } = await ctx.params;

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) throw new NotFoundError("Category not found");

  return NextResponse.json(category);
});

// PATCH /api/categories/[id] — Update
export const PATCH = withGuards({ schema: UpdateCategorySchema }, async ({ user, body }, ctx: RouteContext<"/api/categories/[id]">) => {
  const { id } = await ctx.params;

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...body,
      updatedBy: user.id,
    },
  });

  return NextResponse.json(category);
});

// DELETE /api/categories/[id] — Hard Delete
export const DELETE = withGuards({}, async ({ user }, ctx: RouteContext<"/api/categories/[id]">) => {
  const { id } = await ctx.params;

  const category = await prisma.category.delete({
    where: { id },
  });

  return NextResponse.json(category);
});
