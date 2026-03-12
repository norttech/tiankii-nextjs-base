"use client";

import { createContext, use, useState, useCallback, type ReactNode } from "react";

import type { Customer } from "@/types/customer";

interface CustomerContextValue {
  /** All customers belonging to the current user */
  customers: Customer[];
  /** The currently active/selected customer */
  activeCustomer: Customer | null;
  /** Switch to a different customer by ID */
  setActiveCustomerId: (_id: string) => void;
  /** Replace the full customer list (e.g. after fetching or after onboarding) */
  setCustomers: (_customers: Customer[]) => void;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

interface CustomerProviderProps {
  children: ReactNode;
  initialCustomers?: Customer[];
}

export function CustomerProvider({ children, initialCustomers = [] }: CustomerProviderProps) {
  // eslint-disable-next-line @eslint-react/naming-convention/use-state
  const [customers, setCustomersState] = useState<Customer[]>(initialCustomers);
  const [activeId, setActiveId] = useState<string | null>(initialCustomers[0]?.id ?? null);

  const activeCustomer = customers.find((c) => c.id === activeId) ?? customers[0] ?? null;

  const setActiveCustomerId = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const setCustomers = useCallback((next: Customer[]) => {
    setCustomersState(next);
    // Default to first if current active is gone
    setActiveId((prev) => {
      if (next.some((c) => c.id === prev)) return prev;
      return next[0]?.id ?? null;
    });
  }, []);

  return (
    <CustomerContext value={{ customers, activeCustomer, setActiveCustomerId, setCustomers }}>
      {children}
    </CustomerContext>
  );
}

export function useCustomer() {
  const ctx = use(CustomerContext);
  if (!ctx) {
    throw new Error("useCustomer must be used within a <CustomerProvider>");
  }
  return ctx;
}
