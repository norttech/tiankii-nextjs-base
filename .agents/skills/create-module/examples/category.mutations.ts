// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type CreateCategory, type UpdateCategory } from "@/lib/schemas/category/category.schema";

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateCategory) => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategory }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const batchArchiveMutation = useMutation({
    mutationFn: async ({ ids, isArchived }: { ids: string[]; isArchived: boolean }) => {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, isArchived }),
      });
      if (!res.ok) throw new Error("Failed to batch update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to batch delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    archiveMutation,
    batchArchiveMutation,
    batchDeleteMutation,
  };
}
