"use client";

import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("Index");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 text-center gap-8">
      <h1 className="text-4xl font-bold sm:text-6xl tracking-tight">{t("title")}</h1>
      <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl">{t("description")}</p>
    </div>
  );
}
