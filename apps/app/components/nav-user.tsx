"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { clearAccountMirror } from "@turbotemplate/i18n/browser";
import { AppIcon } from "@turbotemplate/ui/components/app-icon";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@turbotemplate/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@turbotemplate/ui/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@turbotemplate/ui/components/ui/sidebar";
import { cn } from "@turbotemplate/ui/lib/utils";
import {
  Bell,
  CreditCard,
  LogOut,
  MoreVertical,
  Settings,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Copy } from "@/components/copy";

const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || "/";

function ProfileAvatar({
  user,
  grayscale,
}: {
  user: ReturnType<typeof useUser>["user"];
  grayscale?: boolean;
}) {
  const t = useTranslations("common");
  const name = user?.fullName?.trim() || user?.username || t("account");
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase();
  return (
    <>
      <Avatar className={cn("h-8 w-8 rounded-lg", grayscale && "grayscale")}>
        <AvatarImage src={user?.imageUrl} alt="" />
        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
        {name}
      </span>
    </>
  );
}

export function NavUser() {
  const t = useTranslations("common");
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <ProfileAvatar user={user} grayscale={true} />
              <MoreVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <ProfileAvatar user={user} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openUserProfile()}>
                <UserCircle />
                {t("account")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href={marketingUrl} className="flex items-center gap-1.5">
                  <AppIcon />
                  <Copy id="Web" />
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/billing"
                  className="flex w-full items-center gap-1.5"
                >
                  <CreditCard />
                  {t("billing")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                <Copy id="Notifications" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings />
                  {t("settings")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                clearAccountMirror();
                void signOut();
              }}
            >
              <LogOut />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
