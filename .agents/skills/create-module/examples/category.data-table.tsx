// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
"use client";
import { useState, useMemo, useCallback, useEffect, useOptimistic, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/lib/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import type { Category } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Loader2,
  SlidersHorizontal,
  Columns3,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getCategoryColumns } from "./CategoryColumns";
import { CategoryDrawer } from "./CategoryDrawer";
import { CategoryBulkToolbar } from "./CategoryBulkToolbar";
import { CategoryDeleteDialog } from "./CategoryDeleteDialog";
import { CategoryCardView } from "./CategoryCardView";

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

// ─── Custom hook: useDebounce ────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Custom hook: useMediaQuery ──────────────────────────────────────────────
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function CategoryDataTable() {
  const t = useTranslations("categories");
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isMobile = useMediaQuery("(max-width: 767px)");

  // ── URL State Sync ──────────────────────────────────────────────────────
  const urlPage = Number(searchParams.get("page")) || 1;
  const urlPageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;
  const urlSearch = searchParams.get("search") || "";
  const urlSort = searchParams.get("sort") || "";
  const urlArchived = searchParams.get("archived") === "true";

  const [page, setPage] = useState(urlPage);
  const [pageSize] = useState(urlPageSize);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [showArchived, setShowArchived] = useState(urlArchived);
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  // ── TanStack Table State ────────────────────────────────────────────────
  const [sorting, setSorting] = useState<SortingState>(() => {
    if (!urlSort) return [];
    return urlSort.split(",").map((s) => ({
      id: s.replace(/^[+-]/, ""),
      desc: s.startsWith("-"),
    }));
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // ── Drawer State ────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // ── Delete Dialog State ─────────────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // ── Sync state → URL (no sensitive data) ────────────────────────────────
  const syncUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (sorting.length > 0) {
      params.set(
        "sort",
        sorting.map((s) => `${s.desc ? "-" : "+"}${s.id}`).join(",")
      );
    }
    if (showArchived) params.set("archived", "true");
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [page, debouncedSearch, sorting, showArchived, pathname, router]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, showArchived]);

  // ── Build API query string ──────────────────────────────────────────────
  const apiQueryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (sorting.length > 0) {
      params.set(
        "sort",
        sorting.map((s) => `${s.desc ? "-" : "+"}${s.id}`).join(",")
      );
    }
    params.set("isArchived", String(showArchived));
    return params.toString();
  }, [page, pageSize, debouncedSearch, sorting, showArchived]);

  // ── Data Query ──────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery<PaginatedResponse<Category>>({
    queryKey: ["categories", apiQueryString],
    queryFn: () =>
      fetch(`/api/categories?${apiQueryString}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      }),
    placeholderData: (prev) => prev,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff
  });

  const categories = data?.data ?? [];
  const total = data?.pagination?.totalItems ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  // ── Optimistic UI for status toggle ─────────────────────────────────────
  const [optimisticCategories, setOptimistic] = useOptimistic(
    categories,
    (state, { id, isArchived }: { id: string; isArchived: boolean }) =>
      state.map((c) => (c.id === id ? { ...c, isArchived } : c))
  );

  const [, startTransition] = useTransition();

  // ── Mutations ───────────────────────────────────────────────────────────
  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      }),
    onMutate: async (id) => {
      // Optimistic: archive the record immediately
      startTransition(() => {
        setOptimistic({ id, isArchived: true });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.archived"));
    },
    onError: () => {
      // Rollback happens automatically when query refetches
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.error(t("notifications.error"));
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: false }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      }),
    onMutate: async (id) => {
      startTransition(() => {
        setOptimistic({ id, isArchived: false });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.restored"));
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.error(t("notifications.error"));
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/categories/${id}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.deleted_permanent"));
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
    },
    onError: () => toast.error(t("notifications.error")),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/categories/${id}/duplicate`, {
        method: "POST",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.duplicated"));
    },
    onError: () => toast.error(t("notifications.error")),
  });

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      fetch(`/api/categories`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setRowSelection({});
      toast.success(t("notifications.deleted_batch"));
    },
    onError: () => toast.error(t("notifications.error")),
  });

  const batchArchiveMutation = useMutation({
    mutationFn: ({ ids, isArchived }: { ids: string[]; isArchived: boolean }) =>
      fetch(`/api/categories`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, isArchived }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setRowSelection({});
      toast.success(variables.isArchived ? t("notifications.archived_batch") : t("notifications.restored_batch"));
    },
    onError: () => toast.error(t("notifications.error")),
  });

  // ── Action Handlers ─────────────────────────────────────────────────────
  function handleEdit(category: Category) {
    setEditingCategory(category);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }

  function handleCreate() {
    setEditingCategory(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  }

  function handleArchive(category: Category) {
    archiveMutation.mutate(category.id);
  }

  function handleHardDelete(category: Category) {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  }

  function handleRestore(category: Category) {
    restoreMutation.mutate(category.id);
  }

  function handlePrint(_category: Category) {
    window.print();
  }

  // ── Column Definitions ──────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      getCategoryColumns(t, {
        onEdit: handleEdit,
        onArchive: handleArchive,
        onDelete: handleHardDelete,
        onDuplicate: (c) => duplicateMutation.mutate(c.id),
        onRestore: handleRestore,
        onPrint: handlePrint,
      }),
    [t]
  );

  // ── TanStack Table Instance ─────────────────────────────────────────────
  const table = useReactTable({
    data: optimisticCategories,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", { count: total })}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("actions.add_new")}
        </Button>
      </div>

      {/* ── Search & Filter Bar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search.placeholder")}
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label={t("search.placeholder")}
          />
        </div>

        {/* Archived filter toggle */}
        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {showArchived ? t("filters.showing_archived") : t("filters.show_archived")}
        </Button>

        {/* Column Visibility Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3 className="mr-2 h-4 w-4" />
              {t("actions.columns")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {t(`fields.${column.id}`) || column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {isFetching && !isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* ── Bulk Actions Toolbar ──────────────────────────────────────────── */}
      {selectedIds.length > 0 && (
        <CategoryBulkToolbar
          selectedCount={selectedIds.length}
          onArchive={() => batchArchiveMutation.mutate({ ids: selectedIds, isArchived: true })}
          onDelete={() => batchDeleteMutation.mutate(selectedIds)}
          onDeselectAll={() => setRowSelection({})}
          isArchiving={batchArchiveMutation.isPending}
          isDeleting={batchDeleteMutation.isPending}
          t={t}
        />
      )}

      {/* ── Mobile Card View ─────────────────────────────────────────────── */}
      {isMobile ? (
        <CategoryCardView
          categories={optimisticCategories}
          isLoading={isLoading}
          selectedIds={new Set(selectedIds)}
          onToggleSelect={(id) =>
            setRowSelection((prev) => ({
              ...prev,
              [id]: !prev[id],
            }))
          }
          onEdit={handleEdit}
          onArchive={handleArchive}
          onDelete={handleHardDelete}
          onRestore={handleRestore}
          t={t}
        />
      ) : (
        /* ── Desktop Data Table ───────────────────────────────────────────── */
        <div className="rounded-md border overflow-auto max-h-[calc(100vh-300px)]">
          <Table role="table">
            <TableHeader
              className="sticky top-0 z-10 bg-background shadow-sm"
              role="rowgroup"
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} scope="col">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody role="rowgroup">
              {isLoading ? (
                // ── Loading Skeletons ─────────────────────────────────────
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {Array.from({ length: columns.length }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                // ── Empty State ───────────────────────────────────────────
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <PackageOpen className="h-10 w-10 opacity-40" />
                      <p className="text-base font-medium">
                        {debouncedSearch
                          ? t("search.no_results")
                          : showArchived
                            ? t("empty_state.archived")
                            : t("empty_state.default")}
                      </p>
                      {!debouncedSearch && !showArchived && (
                        <Button size="sm" onClick={handleCreate}>
                          <Plus className="mr-2 h-4 w-4" />
                          {t("actions.add_new")}
                        </Button>
                      )}
                      {debouncedSearch && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchInput("")}
                        >
                          {t("search.clear_filters")}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // ── Data Rows with Zebra Stripes ─────────────────────────
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="even:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
          <span>
            {t("pagination.showing", {
              from: Math.min((page - 1) * pageSize + 1, total),
              to: Math.min(page * pageSize, total),
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
            <span className="px-3 tabular-nums font-medium">
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

      {/* ── Side Drawer for Create/Edit ───────────────────────────────────── */}
      <CategoryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        category={editingCategory}
        onSuccess={() => {
          setDrawerOpen(false);
          setEditingCategory(null);
          queryClient.invalidateQueries({ queryKey: ["categories"] });
        }}
      />

      {/* ── Hard Delete Confirmation Dialog ──────────────────────────────── */}
      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={deletingCategory}
        onConfirm={() => {
          if (deletingCategory) {
            hardDeleteMutation.mutate(deletingCategory.id);
          }
        }}
        isPending={hardDeleteMutation.isPending}
      />
    </div>
  );
}
