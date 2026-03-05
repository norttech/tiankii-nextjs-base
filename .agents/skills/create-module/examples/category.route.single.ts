// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { NextResponse } from "next/server";
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

// PATCH /api/categories/[id] — Update (also handles archive/restore via isArchived toggle)
export const PATCH = withGuards({ schema: UpdateCategorySchema }, async ({ user, body }, ctx: RouteContext<"/api/categories/[id]">) => {
  const { id } = await ctx.params;

  // When toggling archive status, set/clear audit fields automatically
  const archivalData =
    body.isArchived === true
      ? { archivedAt: new Date(), archivedBy: user.id }
      : body.isArchived === false
        ? { archivedAt: null, archivedBy: null }
        : {};

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...body,
      ...archivalData,
      updatedBy: user.id,
    },
  });

  return NextResponse.json(category);
});

// DELETE /api/categories/[id] — Permanent hard delete
export const DELETE = withGuards({}, async ({ user }, ctx: RouteContext<"/api/categories/[id]">) => {
  const { id } = await ctx.params;

  const category = await prisma.category.delete({
    where: { id },
  });

  return NextResponse.json(category);
});
