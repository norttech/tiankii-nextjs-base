import { LoginForm } from "@/components/auth/login-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: PageProps<"/[locale]/login">) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Login" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default function LoginPage(_props: PageProps<"/[locale]/login">) {
  return <LoginForm />;
}
