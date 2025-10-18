"use client";

import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Image
            src="/turbotemplate.svg"
            alt="turbotemplate"
            width={20}
            height={20}
          />
          <span className="font-semibold">turbotemplate</span>
        </Link>
        <nav className="ml-auto flex items-center gap-3 text-sm">
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
