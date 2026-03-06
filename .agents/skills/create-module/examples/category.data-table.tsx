// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
  type Updater,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Columns3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

import type { Category, CreateCategory, UpdateCategory } from "@/lib/schemas/category/category.schema";
import { useCategoryQuery } from "@/lib/hooks/categories/useCategoryQuery";
import { useCategoryMutations } from "@/lib/hooks/categories/useCategoryMutations";
import { useCategoryUrlState } from "@/lib/hooks/categories/useCategoryUrlState";
import { getCategoryColumns } from "./CategoryColumns";
import { CategoryDrawer } from "./CategoryDrawer";
import { CategoryDeleteDialog } from "./CategoryDeleteDialog";
import { CategoryBulkToolbar } from "./CategoryBulkToolbar";
import { CategoryCardView } from "./CategoryCardView";

export function CategoryDataTable() {
  const t = useTranslations();

  // ── URL State (nuqs) ──
  const {
    page,
    setPage,
    pageSize,
    setPageSize: _setPageSize,
    search,
    setSearch,
    sort,
    setSort,
    isArchived,
    setIsArchived,
  } = useCategoryUrlState();

  const isArchivedView = isArchived === "true";

  // ── Debounced Search ──
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  // ── Queries & Mutations ──
  const { data, isLoading } = useCategoryQuery({
    page,
    pageSize,
    search,
    sort,
    isArchived: isArchivedView,
  });

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    archiveMutation,
    batchArchiveMutation,
    batchDeleteMutation,
  } = useCategoryMutations();

  // ── Local State ──
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // ── Modals State ──
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ── Sort: URL ↔ TanStack ──
  const sorting: SortingState = sort
    ? [{ id: sort.replace(/^[+-]/, ""), desc: sort.startsWith("-") }]
    : [];

  const handleSortingChange = (updater: Updater<SortingState>) => {
    const newSorting = typeof updater === "function" ? updater(sorting) : updater;
    if (newSorting.length > 0) {
      setSort(`${newSorting[0]?.desc ? "-" : "+"}${newSorting[0]?.id}`);
    } else {
      setSort("");
    }
  };

  // ── Data ──
  const categories: Category[] = data?.data || [];
  const total = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  // ── Actions Map ──
  const actions = {
    onEdit: (category: Category) => {
      setSelectedCategory(category);
      setDrawerOpen(true);
    },
    onArchive: (category: Category) => {
      archiveMutation.mutate(
        { id: category.id!, isArchived: true },
        { onSuccess: () => toast.success(t("Categories.toast.archived")) },
      );
    },
    onRestore: (category: Category) => {
      archiveMutation.mutate(
        { id: category.id!, isArchived: false },
        { onSuccess: () => toast.success(t("Categories.toast.restored")) },
      );
    },
    onDelete: (category: Category) => {
      setSelectedCategory(category);
      setDeleteDialogOpen(true);
    },
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: categories,
    columns: getCategoryColumns(t, actions),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSortingChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
    getRowId: (row) => row.id as string,
  });

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  // ── Drawer Submit ──
  const onDrawerSubmit = (formData: CreateCategory | UpdateCategory) => {
    if (selectedCategory) {
      updateMutation.mutate(
        { id: selectedCategory.id!, data: formData },
        {
          onSuccess: () => {
            setDrawerOpen(false);
            toast.success(t("Categories.toast.updated"));
          },
        },
      );
    } else {
      createMutation.mutate(formData as CreateCategory, {
        onSuccess: () => {
          setDrawerOpen(false);
          toast.success(t("Categories.toast.created"));
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("Categories.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("Categories.subtitle", { count: total })}
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setDrawerOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("Categories.actions.createNew")}
        </Button>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex max-w-sm flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Categories.actions.search")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Archive Toggle */}
          <Button
            variant={isArchivedView ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsArchived(isArchivedView ? "false" : "true")}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {isArchivedView ? t("Common.showingArchived") : t("Common.showArchived")}
          </Button>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="mr-2 h-4 w-4" />
                {t("Categories.actions.columns")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(val) => col.toggleVisibility(!!val)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {table.getVisibleFlatColumns().map((col) => (
                    <TableCell key={col.id}>
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleFlatColumns().length}
                  className="h-32 text-center"
                >
                  {t("Categories.emptyState")}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="even:bg-muted/30"
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

      {/* ── Mobile Card View ── */}
      <div className="block md:hidden">
        <CategoryCardView
          categories={categories}
          isLoading={isLoading}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          actions={actions}
          isArchivedView={isArchivedView}
        />
      </div>

      {/* ── Bulk Action Toolbar ── */}
      <CategoryBulkToolbar
        selectedCount={selectedIds.length}
        isArchivedView={isArchivedView}
        onDeselectAll={() => setRowSelection({})}
        onArchive={() => {
          batchArchiveMutation.mutate(
            { ids: selectedIds, isArchived: true },
            {
              onSuccess: () => {
                setRowSelection({});
                toast.success(t("Categories.toast.batchArchived"));
              },
            },
          );
        }}
        onRestore={() => {
          batchArchiveMutation.mutate(
            { ids: selectedIds, isArchived: false },
            {
              onSuccess: () => {
                setRowSelection({});
                toast.success(t("Categories.toast.batchRestored"));
              },
            },
          );
        }}
        onDelete={() => {
          if (confirm(t("Common.deletePermanently"))) {
            batchDeleteMutation.mutate(selectedIds, {
              onSuccess: () => {
                setRowSelection({});
                toast.success(t("Categories.toast.batchDeleted"));
              },
            });
          }
        }}
      />

      {/* ── Pagination ── */}
      {!isLoading && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            {t("Common.showing", {
              from: Math.min((page - 1) * pageSize + 1, total),
              to: Math.min(page * pageSize, total),
              total,
            })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("Common.previous")}
            </Button>
            <span className="px-3 font-medium tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              {t("Common.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Drawers & Dialogs ── */}
      <CategoryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={selectedCategory}
        onSubmit={onDrawerSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <CategoryDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        category={selectedCategory}
        isLoading={deleteMutation.isPending}
        onConfirm={(id) => {
          deleteMutation.mutate(id, {
            onSuccess: () => {
              setDeleteDialogOpen(false);
              toast.success(t("Categories.toast.deleted"));
            },
          });
        }}
      />
    </div>
  );
}
