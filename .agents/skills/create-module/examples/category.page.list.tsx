// @ts-nocheck
/* eslint-disable */
import { useMemo } from "react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Eye, Edit, Trash2, Copy } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CategoryListPage() {
  const t = useTranslations("categories");
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((res) => res.json()),
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.deleted"));
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/categories/duplicate`, {
        method: "POST",
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("notifications.duplicated"));
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href="/categories/create">
            <Plus className="mr-2 h-4 w-4" /> {t("actions.add_new")}
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("fields.name")}</TableHead>
              <TableHead>{t("fields.description")}</TableHead>
              <TableHead className="text-right">{t("actions.label")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.data?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description || "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/categories/${category.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> {t("actions.view")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/categories/${category.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> {t("actions.edit")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateMutation.mutate(category.id)}>
                        <Copy className="mr-2 h-4 w-4" /> {t("actions.duplicate")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (confirm(t("confirmations.delete"))) {
                            softDeleteMutation.mutate(category.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> {t("actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
