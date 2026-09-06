"use client";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/app-shell";
import { DashboardBillingSection } from "@/components/dashboard-billing-section";

export default function BillingPage() {
  const t = useTranslations("billing");
  return (
    <AppShell title={t("title")} subtitle={t("description")}>
      <DashboardBillingSection />
    </AppShell>
  );
}
