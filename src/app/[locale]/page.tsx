import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Index");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <main className="flex flex-col items-center gap-8 px-4 text-center">
        <h1 className="text-4xl font-bold sm:text-6xl">{t("title")}</h1>
        <p className="text-lg text-muted-foreground sm:text-xl">{t("description")}</p>
      </main>
    </div>
  );
}
