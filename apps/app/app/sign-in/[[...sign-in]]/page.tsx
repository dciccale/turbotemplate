"use client";
import { product } from "@turbotemplate/i18n";
import { useTranslations } from "next-intl";
import { AuthPanel } from "@/components/auth-panel";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function Page() {
  const t = useTranslations("auth");
  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <LanguageSwitcher />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            {t("welcome", { brand: product.name })}
          </h1>
          <p className="text-muted-foreground">
            {t("signIn", { brand: product.name })}
          </p>
        </div>
        <div>
          <AuthPanel mode="sign-in" />
        </div>
      </div>
    </div>
  );
}
