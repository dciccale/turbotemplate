"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/app-shell";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function SettingsPage() {
  const t = useTranslations("settings");
  return (
    <AppShell title={t("title")}>
      <div className="mx-4 w-auto max-w-3xl space-y-6 lg:mx-6">
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        <section
          aria-labelledby="preferences-title"
          className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
        >
          <div className="flex items-center gap-3 border-b px-5 py-4 sm:px-6">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
              <Languages
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <h2 id="preferences-title" className="text-sm font-semibold">
              {t("preferences")}
            </h2>
          </div>
          <div className="p-5 sm:p-6">
            <LanguageSwitcher />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
