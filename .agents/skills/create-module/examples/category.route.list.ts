// @ts-nocheck
/* eslint-disable */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { QueryCategorySchema, CreateCategorySchema } from "@/lib/schemas/category/category.schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = QueryCategorySchema.parse(Object.fromEntries(searchParams));

    const skip = (params.page - 1) * params.limit;

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
        take: params.limit,
        orderBy: { [params.sortBy]: params.sortOrder },
      }),
      prisma.category.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    });
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
