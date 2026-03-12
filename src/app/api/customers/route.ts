import { NextResponse } from "next/server";

import { getCustomersByUserId, addCustomer } from "@/lib/mock/mock-customers";
import { CreateCustomerSchema } from "@/lib/schemas/customer/customer.schema";
import { withGuards } from "@/middlewares";

/**
 * GET /api/customers
 * Returns the customers associated with the current session user.
 */
export const GET = withGuards({}, async (ctx) => {
  const userId = ctx.user.id!;
  const customers = getCustomersByUserId(userId);
  return NextResponse.json({ data: customers });
});

/**
 * POST /api/customers
 * Creates a new customer for the current session user.
 */
export const POST = withGuards({ schema: CreateCustomerSchema }, async (ctx) => {
  const customer = addCustomer(ctx.user.id!, ctx.body);
  return NextResponse.json({ data: customer }, { status: 201 });
});
