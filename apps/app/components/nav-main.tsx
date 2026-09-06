"use client";

import { Button } from "@turbotemplate/ui/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@turbotemplate/ui/components/ui/sidebar";
import { CirclePlus, type LucideIcon, Mail } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Copy } from "@/components/copy";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const normalizedPathname =
    pathname === "/app"
      ? "/"
      : pathname.startsWith("/app/")
        ? pathname.slice("/app".length)
        : pathname;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip={t("QuickCreate")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <CirclePlus />
              <span>
                <Copy id="QuickCreate" />
              </span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <Mail />
              <span className="sr-only">
                <Copy id="Inbox" />
              </span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isLinked = item.url !== "#";
            const routePath = item.url.startsWith("/app")
              ? item.url.slice("/app".length) || "/"
              : item.url;
            const isActive =
              isLinked &&
              (routePath === "/"
                ? normalizedPathname === "/"
                : normalizedPathname === routePath ||
                  normalizedPathname.startsWith(`${routePath}/`));

            return (
              <SidebarMenuItem key={item.title}>
                {isLinked ? (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
