// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
"use client";
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
} from "lucide-react";
import { toast } from "react-hot-toast";

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

  // API returns the category record directly — no { data } wrapper
  const { data: category, isLoading, isError } = useQuery<Category>({
    queryKey: ["category", id],
    queryFn: () =>
      fetch(`/api/categories/${id}`).then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      }),
  });

  const softDeleteMutation = useMutation({
    mutationFn: () => fetch(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.deleted"));
      router.push("/categories");
    },
    onError: () => toast.error(t("notifications.error")),
  });

  const duplicateMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/categories/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id }),
      }).then((res) => res.json()),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.duplicated"));
      router.push(`/categories/${created.id}`);
    },
    onError: () => toast.error(t("notifications.error")),
  });

  function handleDelete() {
    if (confirm(t("confirmations.delete"))) {
      softDeleteMutation.mutate();
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Error / not found state ────────────────────────────────────────────────
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

  const { name, description, color, createdAt, updatedAt, createdBy, updatedBy } =
    category;

  // ── Main view ──────────────────────────────────────────────────────────────
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
          <Button variant="outline" asChild>
            <Link href={`/categories/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {t("actions.edit")}
            </Link>
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

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={softDeleteMutation.isPending}
          >
            {softDeleteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {t("actions.delete")}
          </Button>
        </div>
      </div>

      {/* Main detail card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{name}</CardTitle>
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
    </div>
  );
}
