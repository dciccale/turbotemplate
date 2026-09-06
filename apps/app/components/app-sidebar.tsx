"use client";

import { product } from "@turbotemplate/i18n";
import { AppLogo } from "@turbotemplate/ui/components/app-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@turbotemplate/ui/components/ui/sidebar";
import {
  BarChart,
  Bot,
  Camera,
  CreditCard,
  Database,
  FileBarChart,
  FileText,
  FileType,
  Folder,
  HelpCircle,
  LayoutDashboard,
  List,
  Search,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type * as React from "react";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { dashboardKey } from "@/i18n/labels";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Billing",
      url: "/billing",
      icon: CreditCard,
    },
    {
      title: "Lifecycle",
      url: "#",
      icon: List,
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChart,
    },
    {
      title: "Projects",
      url: "#",
      icon: Folder,
    },
    {
      title: "Team",
      url: "#",
      icon: Users,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: Camera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileText,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: Bot,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: Database,
    },
    {
      name: "Reports",
      url: "#",
      icon: FileBarChart,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: FileType,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("dashboard");
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <Link href="/" className="flex w-full items-center justify-center">
          <AppLogo name={product.name} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain.map((item) => ({
            ...item,
            title: t(dashboardKey(item.title.replaceAll(" ", ""))),
          }))}
        />
        <NavDocuments
          items={data.documents.map((item) => ({
            ...item,
            name: t(dashboardKey(item.name.replaceAll(" ", ""))),
          }))}
        />
        <NavSecondary
          items={data.navSecondary.map((item) => ({
            ...item,
            title: t(dashboardKey(item.title.replaceAll(" ", ""))),
          }))}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
