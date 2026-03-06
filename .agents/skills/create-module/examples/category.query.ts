// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { useQuery } from "@tanstack/react-query";

interface CategoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  isArchived?: boolean;
}

export function useCategoryQuery(params: CategoryQueryParams) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const res = await fetch(`/api/categories?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });
}

export function useCategorySingleQuery(id: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: async () => {
      const res = await fetch(`/api/categories/${id}`);
      if (!res.ok) throw new Error("Failed to fetch category");
      return res.json();
    },
    enabled: !!id,
  });
}
