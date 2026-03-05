// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Trash2,
  Archive,
  X,
  MoreVertical,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryBulkToolbarProps {
  selectedCount: number;
  onArchive: () => void;
  onDelete: () => void;
  onDeselectAll: () => void;
  isArchiving: boolean;
  isDeleting: boolean;
  t: (key: string, values?: Record<string, unknown>) => string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function CategoryBulkToolbar({
  selectedCount,
  onArchive,
  onDelete,
  onDeselectAll,
  isArchiving,
  isDeleting,
  t,
}: CategoryBulkToolbarProps) {
  return (
    <div
      className="sticky top-0 z-20 flex items-center justify-between gap-4 rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 shadow-sm"
      role="toolbar"
      aria-label={t("bulk.toolbar_label")}
    >
      {/* ── Selection count with aria-live ──────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span
          className="text-sm font-medium"
          aria-live="polite"
          aria-atomic="true"
        >
          {t("bulk.selected_count", { count: selectedCount })}
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDeselectAll}
          className="h-7 text-xs"
        >
          <X className="mr-1 h-3 w-3" />
          {t("bulk.deselect_all")}
        </Button>
      </div>

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Primary: Non-destructive — visible */}
        <Button
          variant="outline"
          size="sm"
          onClick={onArchive}
          disabled={isArchiving}
        >
          {isArchiving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Archive className="mr-2 h-4 w-4" />
          )}
          {t("bulk.archive")}
        </Button>

        {/* Destructive: Hidden in overflow menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">{t("bulk.more_actions")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t("bulk.delete_permanent")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
