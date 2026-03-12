/**
 * In-memory mock customer store.
 * Acts as a fake DB for development / onboarding demo.
 */

import type { Customer } from "@/types/customer";

let nextId = 3;

const customers: Customer[] = [
  {
    id: "1",
    userId: "1", // admin@veristable.io
    name: "Acme Corporation",
    industry: "Technology",
    contactEmail: "contact@acme.com",
    contactPhone: "+1 555-0100",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "1", // admin@veristable.io (has multiple)
    name: "Globex Industries",
    industry: "Manufacturing",
    contactEmail: "info@globex.com",
    contactPhone: "+1 555-0200",
    createdAt: "2025-02-20T14:30:00Z",
  },
];

export function getCustomersByUserId(userId: string): Customer[] {
  return customers.filter((c) => c.userId === userId);
}

export function addCustomer(
  userId: string,
  data: Omit<Customer, "id" | "userId" | "createdAt">,
): Customer {
  const customer: Customer = {
    ...data,
    id: String(nextId++),
    userId,
    createdAt: new Date().toISOString(),
  };
  customers.push(customer);
  return customer;
}
