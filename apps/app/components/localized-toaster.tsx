"use client";
import { useTranslations } from "next-intl";
import { Toaster } from "sonner";
export function LocalizedToaster() {
  const t = useTranslations("dashboard");
  return <Toaster containerAriaLabel={t("Notifications")} />;
}
