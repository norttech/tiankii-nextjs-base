// @ts-nocheck
/* eslint-disable */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateCategorySchema } from "@/lib/schemas/category/category.schema";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUniqueOrThrow({
      where: { id: params.id, isActive: true, deletedAt: null },
    });
    return NextResponse.json({ data: category });
  } catch (error) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const payload = UpdateCategorySchema.parse(body);

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...payload,
        updatedBy: "system-user-id", // In actual app, get from session
      },
    });

    return NextResponse.json({ data: category });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: "system-user-id", // In actual app, get from session
      },
    });

    return NextResponse.json({
      data: category,
      message: "Category soft-deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
