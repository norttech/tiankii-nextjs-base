import { getTranslations } from "next-intl/server";

import { HeroSection } from "@/components/home/hero-section";

export async function generateMetadata(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Index" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Home(_props: PageProps<"/[locale]">) {
  return (
    <main>
      <HeroSection />
    </main>
  );
}
