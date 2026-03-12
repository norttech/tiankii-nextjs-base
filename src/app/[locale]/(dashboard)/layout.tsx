import { auth } from "@/auth";
import { CustomerProvider } from "@/components/providers/customer-context";
import { getCustomersByUserId } from "@/lib/mock/mock-customers";
import type { Customer } from "@/types/customer";

/**
 * Dashboard layout — wraps all authenticated pages with the CustomerProvider.
 * Fetches the user's customers server-side and passes them as initial data.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id;

  let initialCustomers: Customer[] = [];

  if (userId) {
    initialCustomers = getCustomersByUserId(userId);
  }

  return <CustomerProvider initialCustomers={initialCustomers}>{children}</CustomerProvider>;
}
