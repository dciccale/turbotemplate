"use client";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/app-shell";
import { LanguageSwitcher } from "@/components/language-switcher";
export default function SettingsPage() {
  const t = useTranslations("settings");
  return (
    <AppShell title={t("title")}>
      <section className="mx-4 rounded-lg border p-6 lg:mx-6">
        <p className="mb-6 text-muted-foreground">{t("description")}</p>
        <LanguageSwitcher />
      </section>
    </AppShell>
  );
}
