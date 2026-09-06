"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
export default function NotFound() {
  const t = useTranslations("common");
  return (
    <main className="p-6">
      <h1>{t("notFound")}</h1>
      <Link href="/">{t("dashboard")}</Link>
    </main>
  );
}
