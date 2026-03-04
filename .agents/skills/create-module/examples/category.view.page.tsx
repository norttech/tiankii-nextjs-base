// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { CategoryView } from "@/components/modules/categories/CategoryView";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: PageProps<"/[locale]/categories/[id]">) {
  const { locale, id } = await props.params;
  const t = await getTranslations({ locale, namespace: "categories" });

  return {
    title: `${t("title")} - ${id}`,
  };
}

export default async function CategoryViewPage(props: PageProps<"/[locale]/categories/[id]">) {
  const { id } = await props.params;
  return (
    <div className="container mx-auto py-6">
      <CategoryView id={id} />
    </div>
  );
}
