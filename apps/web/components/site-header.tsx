"use client";

import { Button } from "@turbotemplate/ui/components/button";
import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              {/* Chat bubble icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
                aria-hidden="true"
              >
                <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
              </svg>
              <span className="font-semibold">turbotemplate</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/pricing"
              className="hover:text-foreground/80 text-foreground/70"
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              className="hover:text-foreground/80 text-foreground/70"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild className="hidden md:inline-flex">
              <a href="/app">Open Demo</a>
            </Button>

            {/* mobile menu button */}
            <button
              aria-label="Open menu"
              type="button"
              className="md:hidden inline-flex size-10 items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
              onClick={() => setOpen((v) => !v)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* mobile drawer */}
      {open ? (
        <div className="md:hidden border-t">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-2">
            <Link
              href="/pricing"
              className="py-2 text-foreground/80"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              className="py-2 text-foreground/80"
              onClick={() => setOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/app"
              className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:bg-primary/90"
              onClick={() => setOpen(false)}
            >
              Open Demo
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
