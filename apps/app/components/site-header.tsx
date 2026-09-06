"use client";
import { ThemeToggle } from "@turbotemplate/ui/components/theme-toggle";
import { Separator } from "@turbotemplate/ui/components/ui/separator";
import { SidebarTrigger } from "@turbotemplate/ui/components/ui/sidebar";
import { useTranslations } from "next-intl";

export function SiteHeader({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const t = useTranslations("common");
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="min-w-0">
          <h1 className="text-base font-medium">{title ?? t("dashboard")}</h1>
          {subtitle ? (
            <p className="text-muted-foreground truncate text-sm">{subtitle}</p>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle label={t("theme")} />
        </div>
      </div>
    </header>
  );
}
