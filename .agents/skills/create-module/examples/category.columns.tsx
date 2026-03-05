// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  Trash2,
  Copy,
  Printer,
  ArchiveRestore,
  AlertTriangle,
} from "lucide-react";
import { Link } from "@/lib/i18n/routing";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ColumnActions {
  onEdit: (category: Category) => void;
  onArchive: (category: Category) => void;
  onRestore: (category: Category) => void;
  onDelete: (category: Category) => void;
  onDuplicate: (category: Category) => void;
  onPrint: (category: Category) => void;
}

// ─── Column Definitions ──────────────────────────────────────────────────────
export function getCategoryColumns(
  t: (key: string) => string,
  actions: ColumnActions
): ColumnDef<Category>[] {
  return [
    // ── Selection column ──────────────────────────────────────────────────
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("actions.select_all")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t("actions.select_row")}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },

    // ── Name column (primary, sortable) ──────────────────────────────────
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3 h-8 data-[state=active]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("fields.name")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link
          href={`/categories/${row.original.id}`}
          className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          {row.getValue("name")}
        </Link>
      ),
    },

    // ── Description column ───────────────────────────────────────────────
    {
      accessorKey: "description",
      header: t("fields.description"),
      cell: ({ row }) => (
        <span className="max-w-xs truncate text-muted-foreground">
          {row.getValue("description") || "—"}
        </span>
      ),
    },

    // ── Color column ─────────────────────────────────────────────────────
    {
      accessorKey: "color",
      header: t("fields.color"),
      cell: ({ row }) => {
        const color = row.getValue("color") as string | null;
        if (!color) return "—";
        return (
          <span className="flex items-center gap-2">
            <span
              className="h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground">{color}</span>
          </span>
        );
      },
    },

    // ── Status column (optimistic toggle candidate) ──────────────────────
    {
      accessorKey: "isArchived",
      header: t("fields.status"),
      cell: ({ row }) => {
        const isArchived = row.getValue("isArchived") as boolean;
        return isArchived ? (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {t("status.archived")}
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {t("status.active")}
          </Badge>
        );
      },
    },

    // ── Created At (sortable) ────────────────────────────────────────────
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("fields.created_at")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
        </span>
      ),
    },

    // ── Row Actions column ───────────────────────────────────────────────
    {
      id: "actions",
      enableHiding: false,
      size: 50,
      cell: ({ row }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("actions.open_menu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* ── Non-destructive actions ── */}
              <DropdownMenuItem asChild>
                <Link href={`/categories/${category.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t("actions.view")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                {t("actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onPrint(category)}>
                <Printer className="mr-2 h-4 w-4" />
                {t("actions.print")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onDuplicate(category)}>
                <Copy className="mr-2 h-4 w-4" />
                {t("actions.duplicate")}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* ── Archive / Restore (status toggle) ── */}
              {category.isArchived ? (
                <DropdownMenuItem onClick={() => actions.onRestore(category)}>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  {t("actions.restore")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-amber-600 focus:text-amber-600"
                  onClick={() => actions.onArchive(category)}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {t("actions.archive")}
                </DropdownMenuItem>
              )}

              {/* ── Permanent Delete ── */}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => actions.onDelete(category)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("actions.delete_permanent")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
