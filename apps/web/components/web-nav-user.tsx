"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@turbotemplate/ui/components/ui/avatar";
import { Button } from "@turbotemplate/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@turbotemplate/ui/components/ui/dropdown-menu";
import {
  ArrowRight,
  ChevronsUpDown,
  CircleUserRound,
  Cog,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || "/";

export function WebNavUser({ onAction }: { onAction?: () => void }) {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    onAction?.();
    await signOut({ redirectUrl: marketingUrl });
  };

  if (!isLoaded) {
    return null;
  }

  if (!user) {
    return (
      <a href="/app">
        <Button variant="outline" size="sm">
          Entrar
        </Button>
      </a>
    );
  }

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 px-2 data-[state=open]:bg-accent"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
            <AvatarFallback className="rounded-lg">
              {(user.fullName || user.firstName || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-24 truncate text-sm md:inline-block">
            {user.firstName || "Account"}
          </span>
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="cursor-default px-2 py-1.5 text-left text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CircleUserRound className="size-4" />
              <span className="truncate font-medium">
                {user.primaryEmailAddress?.emailAddress || ""}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <a href="/app">
            <ArrowRight className="size-4" />
            <span>Open app</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onAction?.();
            openUserProfile();
          }}
        >
          <Cog className="h-4 w-4" />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
