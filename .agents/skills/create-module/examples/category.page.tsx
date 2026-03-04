// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { CategoryList } from "@/components/modules/categories/CategoryList";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: PageProps<"/[locale]/categories">) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "categories" });

  return {
    title: t("title"),
    description: t("subtitle", { count: 0 }),
  };
}

export default function CategoryListPage(_props: PageProps<"/[locale]/categories">) {
  return (
    <div className="container mx-auto py-6">
      <CategoryList />
    </div>
  );
}
