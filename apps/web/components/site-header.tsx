"use client";

import { parseLocale, product, publicPath } from "@turbotemplate/i18n";
import { AppLogo } from "@turbotemplate/ui/components/app-logo";
import { ThemeToggle } from "@turbotemplate/ui/components/theme-toggle";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { repositoryUrl } from "@/lib/project";
import { GitHubIcon } from "./github-icon";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader({ search }: { search: string }) {
  const t = useTranslations("marketing");
  const c = useTranslations("common");
  const locale = parseLocale(useLocale()) ?? "en";
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2">
            <Link
              href={publicPath("/", locale, true)}
              className="flex items-center text-foreground"
            >
              <AppLogo name={product.name} />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href={`${publicPath("/", locale, true)}#features`}
              className="hover:text-foreground/80 text-foreground/70"
            >
              {t("features")}
            </Link>
            <Link
              href={`${publicPath("/", locale, true)}#start`}
              className="hover:text-foreground/80 text-foreground/70"
            >
              {t("getStarted")}
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher search={search} />
            <ThemeToggle size="icon-sm" label={c("theme")} />
            <a
              href={repositoryUrl}
              aria-label={t("viewGithub")}
              className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
            >
              <GitHubIcon className="size-5" />
            </a>

            {/* mobile menu button */}
            <button
              aria-label={c("menu")}
              aria-expanded={open}
              type="button"
              className="md:hidden inline-flex size-8 items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
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
              href={`${publicPath("/", locale, true)}#features`}
              className="py-2 text-foreground/80"
              onClick={() => setOpen(false)}
            >
              {t("features")}
            </Link>
            <Link
              href={`${publicPath("/", locale, true)}#start`}
              className="py-2 text-foreground/80"
              onClick={() => setOpen(false)}
            >
              {t("getStarted")}
            </Link>
            <Link
              href={`/app?lang=${locale}`}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:bg-primary/90"
              onClick={() => setOpen(false)}
            >
              {c("openDemo")}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
