"use client";
import type en from "@turbotemplate/i18n/messages/en.json";
import { useTranslations } from "next-intl";
export function Copy({ id }: { id: keyof typeof en.dashboard }) {
  const t = useTranslations("dashboard");
  return <>{t(id)}</>;
}
