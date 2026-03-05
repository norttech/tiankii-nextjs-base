"use client";

import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("Index");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 text-center text-foreground">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{t("title")}</h1>
      <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">{t("description")}</p>
    </div>
  );
}
