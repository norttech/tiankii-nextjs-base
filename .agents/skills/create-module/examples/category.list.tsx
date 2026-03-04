// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
"use client";
import { useState, useMemo } from "react";
import { Link } from "@/lib/i18n/routing";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Category } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  Trash2,
  Copy,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 20;

export function CategoryList() {
  const t = useTranslations("categories");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  // Build query string from current state
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    return params.toString();
  }, [search, page]);

  // API returns PaginatedResponse<Category> — access .data for the records array
  const { data, isLoading, isFetching } = useQuery<PaginatedResponse<Category>>({
    queryKey: ["categories", search, page],
    queryFn: () => fetch(`/api/categories?${queryString}`).then((res) => res.json()),
    placeholderData: (prev) => prev,
  });

  const categories = data?.data ?? [];
  const total = data?.pagination?.totalItems ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const softDeleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.deleted"));
    },
    onError: () => toast.error(t("notifications.error")),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/categories/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.duplicated"));
    },
    onError: () => toast.error(t("notifications.error")),
  });

  function handleDelete(id: string) {
    if (confirm(t("confirmations.delete"))) {
      softDeleteMutation.mutate(id);
    }
  }

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      fetch(`/api/categories`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setSelectedIds(new Set());
      toast.success(t("notifications.deleted"));
    },
    onError: () => toast.error(t("notifications.error")),
  });

  function handleBatchDelete() {
    if (confirm(t("confirmations.delete_batch", { count: selectedIds.size }))) {
      batchDeleteMutation.mutate(Array.from(selectedIds));
    }
  }

  function handlePrint(id: string) {
    // In a real app, you might trigger a PDF generation or open a print-only view
    window.print();
  }

  function toggleSelectAll() {
    if (selectedIds.size === categories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(categories.map((c) => c.id)));
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", { count: total })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              disabled={batchDeleteMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("actions.delete_batch")} ({selectedIds.size})
            </Button>
          )}
          <Button asChild>
            <Link href="/categories/create">
              <Plus className="mr-2 h-4 w-4" />
              {t("actions.add_new")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Search & filters bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search.placeholder")}
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {isFetching && !isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    categories.length > 0 && selectedIds.size === categories.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>{t("fields.name")}</TableHead>
              <TableHead>{t("fields.description")}</TableHead>
              <TableHead>{t("fields.created_at")}</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading rows
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                  </TableCell>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {search ? t("search.no_results") : t("empty_state")}
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} data-state={selectedIds.has(category.id) && "selected"}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(category.id)}
                      onCheckedChange={() => toggleSelect(category.id)}
                      aria-label="Select row"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/categories/${category.id}`}
                      className="hover:underline"
                    >
                      {category.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {category.description || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t("actions.open_menu")}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/categories/${category.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t("actions.view")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingId(category.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t("actions.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePrint(category.id)}
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          {t("actions.print")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => duplicateMutation.mutate(category.id)}
                          disabled={duplicateMutation.isPending}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {t("actions.duplicate")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(category.id)}
                          disabled={softDeleteMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t("pagination.showing", {
              from: Math.min((page - 1) * PAGE_SIZE + 1, total),
              to: Math.min(page * PAGE_SIZE, total),
              total,
            })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("pagination.previous")}
            </Button>
            <span className="px-3 tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              {t("pagination.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {/* Edit Drawer (Slide-over) */}
      <Sheet open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader className="mb-6">
            <SheetTitle>{t("actions.edit")}</SheetTitle>
            <SheetDescription>
              {t("edit_description")}
            </SheetDescription>
          </SheetHeader>
          
          {editingId ? (
            /* In your actual app, replace this with your `<CategoryForm />` component. */
            <div className="flex items-center justify-center p-8 bg-muted/20 border rounded-md">
              <p className="text-muted-foreground text-sm">
                CategoryForm placeholder for `{editingId}`
              </p>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
