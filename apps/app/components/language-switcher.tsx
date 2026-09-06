"use client";
import { isLocale, localeNames, locales } from "@turbotemplate/i18n";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { useLanguage } from "./locale-provider";
export function LanguageSwitcher() {
  const { locale, changeLocale, saving, error } = useLanguage();
  const t = useTranslations("common");
  const e = useTranslations("errors");
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs">
        {t("language")}
      </label>
      <select
        id={id}
        value={locale}
        disabled={saving}
        onChange={(event) => {
          if (isLocale(event.target.value))
            void changeLocale(event.target.value);
        }}
        className="rounded-md border bg-background px-2 py-1 text-sm"
      >
        {locales.map((value) => (
          <option key={value} value={value} lang={value}>
            {localeNames[value]}
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert" className="max-w-64 text-sm text-destructive">
          {e("saveLocale")}
        </p>
      ) : null}
    </div>
  );
}
