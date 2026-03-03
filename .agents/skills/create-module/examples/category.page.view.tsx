// @ts-nocheck
/* eslint-disable */
"use client";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Printer, Copy, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CategoryViewPage({ params }: { params: { id: string } }) {
  const t = useTranslations("categories");
  const router = useRouter();
  const queryClient = useQueryClient();

  // API returns the category record directly — no { data } wrapper
  const { data: category, isLoading } = useQuery({
    queryKey: ["category", params.id],
    queryFn: () => fetch(`/api/categories/${params.id}`).then((res) => res.json()),
  });

  const softDeleteMutation = useMutation({
    mutationFn: () => fetch(`/api/categories/${params.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.deleted"));
      router.push("/categories");
    },
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
      router.push("/categories");
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!category) return <div>{t("notifications.not_found")}</div>;

  const { name, description, createdAt, isActive } = category;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("actions.back")}
          </Link>
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/categories/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> {t("actions.edit")}
            </Link>
          </Button>
          <Button variant="outline" onClick={() => duplicateMutation.mutate(params.id)}>
            <Copy className="mr-2 h-4 w-4" /> {t("actions.duplicate")}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> {t("actions.print")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm(t("confirmations.delete"))) {
                softDeleteMutation.mutate();
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> {t("actions.delete")}
          </Button>
        </div>
      </div>

      {/* Record detail card */}
      <Card>
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-semibold block uppercase tracking-wider text-muted-foreground">
              {t("fields.description")}
            </span>
            <p className="text-lg">{description || "-"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-semibold block uppercase tracking-wider text-muted-foreground">
                {t("fields.created_at")}
              </span>
              <p>{new Date(createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm font-semibold block uppercase tracking-wider text-muted-foreground">
                {t("fields.status")}
              </span>
              <p>{isActive ? t("status.active") : t("status.inactive")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
