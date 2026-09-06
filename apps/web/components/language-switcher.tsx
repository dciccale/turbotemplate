"use client";
import {
  localeNames,
  locales,
  parseLocale,
  publicPath,
  publicRoute,
} from "@turbotemplate/i18n";
import { writeBrowserPreference } from "@turbotemplate/i18n/browser";
import { Button } from "@turbotemplate/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@turbotemplate/ui/components/ui/dropdown-menu";
import { Check, Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
export function LanguageSwitcher({ search }: { search: string }) {
  const locale = parseLocale(useLocale()) ?? "en";
  const pathname = usePathname();
  const [suffix, setSuffix] = useState(search);
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => {
    if (!pathname) return;
    const update = () =>
      setSuffix(window.location.search + window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);
  const route = publicRoute(pathname)?.route ?? "/";
  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("language")}
          onPointerEnter={(event) => {
            if (event.pointerType !== "mouse") return;
            cancelClose();
            setOpen(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") scheduleClose();
          }}
        >
          <Languages aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40"
        aria-label={t("language")}
        onPointerEnter={cancelClose}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") scheduleClose();
        }}
      >
        {locales.map((language) => (
          <DropdownMenuItem key={language} asChild>
            <a
              href={`/language?locale=${language}&next=${encodeURIComponent(`${publicPath(route, language, true)}${suffix}`)}`}
              hrefLang={language}
              lang={language}
              aria-current={language === locale ? "true" : undefined}
              className="flex items-center justify-between px-3 py-2"
              onClick={() => {
                writeBrowserPreference({ source: "visitor", locale: language });
              }}
            >
              {localeNames[language]}
              {language === locale ? (
                <Check aria-hidden="true" className="size-4" />
              ) : null}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
