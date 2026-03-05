// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
"use client";
import type { Category } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Archive,
  Trash2,
  ArchiveRestore,
  AlertTriangle,
  PackageOpen,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryCardViewProps {
  categories: Category[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (category: Category) => void;
  onArchive: (category: Category) => void;
  onRestore: (category: Category) => void;
  onDelete: (category: Category) => void;
  t: (key: string, values?: Record<string, unknown>) => string;
}

// ─── Component ───────────────────────────────────────────────────────────────
// Mobile card view: stacks header-value pairs vertically for each record.
// Replaces the data table on screens < md breakpoint.
export function CategoryCardView({
  categories,
  isLoading,
  selectedIds,
  onToggleSelect,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  t,
}: CategoryCardViewProps) {
  // ── Loading Skeletons ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={`skeleton-${i}`}>
            <CardContent className="p-4 space-y-3">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ── Empty State ─────────────────────────────────────────────────────────
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <PackageOpen className="h-12 w-12 opacity-40 mb-3" />
        <p className="text-base font-medium">{t("empty_state.default")}</p>
      </div>
    );
  }

  // ── Card List ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-3" role="list" aria-label={t("title")}>
      {categories.map((category) => (
        <Card
          key={category.id}
          data-state={selectedIds.has(category.id) ? "selected" : undefined}
          className="transition-all data-[state=selected]:ring-2 data-[state=selected]:ring-primary/50"
          role="listitem"
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {/* Selection checkbox */}
                <Checkbox
                  checked={selectedIds.has(category.id)}
                  onCheckedChange={() => onToggleSelect(category.id)}
                  aria-label={t("actions.select_row")}
                  className="mt-1"
                />
                <div>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">{t("actions.open_menu")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(category)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t("actions.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {category.isArchived ? (
                    <DropdownMenuItem onClick={() => onRestore(category)}>
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      {t("actions.restore")}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="text-amber-600 focus:text-amber-600"
                      onClick={() => onArchive(category)}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      {t("actions.archive")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("actions.delete_permanent")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-3">
            {/* Stacked header-value pairs */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {category.color && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t("fields.color")}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="h-3 w-3 rounded-full border border-border"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.color}</span>
                  </div>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t("fields.status")}
                </span>
                <div className="mt-0.5">
                  {category.isArchived ? (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                      {t("status.archived")}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
                      {t("status.active")}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t("fields.created_at")}
                </span>
                <p className="mt-0.5 text-muted-foreground tabular-nums">
                  {new Date(category.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
