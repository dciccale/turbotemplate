"use client";
import {
  SidebarInset,
  SidebarProvider,
} from "@turbotemplate/ui/components/ui/sidebar";
import { useTranslations } from "next-intl";
import type { CSSProperties, ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const t = useTranslations("common");
  return (
    <SidebarProvider
      labels={{
        toggle: t("sidebar"),
        title: t("menu"),
        description: t("menu"),
        close: t("close"),
      }}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title ?? t("dashboard")} subtitle={subtitle} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
