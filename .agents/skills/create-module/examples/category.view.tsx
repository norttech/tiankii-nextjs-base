// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Category } from "@prisma/client";
import { Link, useRouter } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Printer,
  Copy,
  ArrowLeft,
  Loader2,
  CalendarDays,
  User,
  Circle,
  ArchiveRestore,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { CategoryDrawer } from "./CategoryDrawer";
import { CategoryDeleteDialog } from "./CategoryDeleteDialog";

// Small helper to render a labelled field row
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="text-sm">{value ?? <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

export function CategoryView({ id }: { id: string }) {
  const t = useTranslations("categories");
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Local State ─────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ── Data Query (with exponential backoff retry) ─────────────────────────
  const { data: category, isLoading, isError } = useQuery<Category>({
    queryKey: ["category", id],
    queryFn: () =>
      fetch(`/api/categories/${id}`).then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      }),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  // ── Mutations ───────────────────────────────────────────────────────────
  const softDeleteMutation = useMutation({
    mutationFn: () => fetch(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.archived"));
      router.push("/categories");
    },
    onError: () => toast.error(t("notifications.error")),
  });

  const restoreMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: false, archivedAt: null }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category", id] });
      toast.success(t("notifications.restored"));
    },
    onError: () => toast.error(t("notifications.error")),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/categories/${id}?hard=true`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.deleted_permanent"));
      setDeleteDialogOpen(false);
      router.push("/categories");
    },
    onError: () => toast.error(t("notifications.error")),
  });

  const duplicateMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/categories/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).then((res) => res.json()),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.duplicated"));
      router.push(`/categories/${created.id}`);
    },
    onError: () => toast.error(t("notifications.error")),
  });

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Error / not found state ─────────────────────────────────────────────
  if (isError || !category) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>{t("notifications.not_found")}</p>
        <Button variant="outline" asChild>
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("actions.back")}
          </Link>
        </Button>
      </div>
    );
  }

  const { name, description, color, isArchived, archivedAt, createdAt, updatedAt, createdBy, updatedBy } =
    category;

  // ── Main view ───────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button variant="ghost" asChild>
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("actions.back")}
          </Link>
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit — opens drawer */}
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {t("actions.edit")}
          </Button>

          <Button
            variant="outline"
            onClick={() => duplicateMutation.mutate()}
            disabled={duplicateMutation.isPending}
          >
            {duplicateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {t("actions.duplicate")}
          </Button>

          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            {t("actions.print")}
          </Button>

          {/* Archive / Restore */}
          {isArchived ? (
            <Button
              variant="outline"
              onClick={() => restoreMutation.mutate()}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArchiveRestore className="mr-2 h-4 w-4" />
              )}
              {t("actions.restore")}
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                if (confirm(t("confirmations.archive"))) {
                  softDeleteMutation.mutate();
                }
              }}
              disabled={softDeleteMutation.isPending}
            >
              {softDeleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t("actions.archive")}
            </Button>
          )}

          {/* Hard Delete */}
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            {t("actions.delete_permanent")}
          </Button>
        </div>
      </div>

      {/* Archived banner */}
      {isArchived && (
        <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 p-3">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t("status.archived")} — {archivedAt && new Date(archivedAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Main detail card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{name}</CardTitle>
                {isArchived ? (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {t("status.archived")}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {t("status.active")}
                  </Badge>
                )}
              </div>
              {description && (
                <CardDescription className="text-base">{description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 space-y-6">
          {/* Core fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {color && (
              <Field
                label={t("fields.color")}
                value={
                  <span className="flex items-center gap-2">
                    <Circle
                      className="h-4 w-4"
                      style={{ fill: color, stroke: color }}
                    />
                    {color}
                  </span>
                }
              />
            )}
          </div>

          <Separator />

          {/* Audit metadata */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("fields.audit_info")}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label={t("fields.created_at")}
                value={
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(createdAt).toLocaleString()}
                  </span>
                }
              />
              {updatedAt && (
                <Field
                  label={t("fields.updated_at")}
                  value={
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(updatedAt).toLocaleString()}
                    </span>
                  }
                />
              )}
              {createdBy && (
                <Field
                  label={t("fields.created_by")}
                  value={
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {createdBy}
                    </span>
                  }
                />
              )}
              {updatedBy && (
                <Field
                  label={t("fields.updated_by")}
                  value={
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {updatedBy}
                    </span>
                  }
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Edit Drawer ────────────────────────────────────────────────── */}
      <CategoryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode="edit"
        category={category}
        onSuccess={() => {
          setDrawerOpen(false);
          queryClient.invalidateQueries({ queryKey: ["category", id] });
        }}
      />

      {/* ── Hard Delete Dialog ─────────────────────────────────────────── */}
      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={category}
        onConfirm={() => hardDeleteMutation.mutate()}
        isPending={hardDeleteMutation.isPending}
      />
    </div>
  );
}
