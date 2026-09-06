"use client";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/app-shell";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import data from "./data.json";

export default function Page() {
  const t = useTranslations("dashboard");
  return (
    <AppShell title={t("Dashboard")} subtitle={t("Overview")}>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </AppShell>
  );
}
