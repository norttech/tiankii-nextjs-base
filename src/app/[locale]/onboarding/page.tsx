import { getTranslations } from "next-intl/server";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export async function generateMetadata(props: PageProps<"/[locale]/onboarding">) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Onboarding" });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default function OnboardingPage(_props: PageProps<"/[locale]/onboarding">) {
  return <OnboardingWizard />;
}
