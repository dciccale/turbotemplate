"use client";

import { isLocale, localeNames, locales } from "@turbotemplate/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@turbotemplate/ui/components/ui/select";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useLanguage } from "./locale-provider";

export function LanguageSwitcher() {
  const { locale, changeLocale, saving, error } = useLanguage();
  const t = useTranslations("common");
  const settings = useTranslations("settings");
  const e = useTranslations("errors");
  const id = useId();
  const [changed, setChanged] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="space-y-1">
          <label htmlFor={id} className="text-sm font-medium">
            {t("language")}
          </label>
          <p id={`${id}-description`} className="text-sm text-muted-foreground">
            {settings("languageDescription")}
          </p>
        </div>
        <Select
          value={locale}
          disabled={saving}
          onValueChange={(value) => {
            if (isLocale(value) && value !== locale) {
              setChanged(true);
              void changeLocale(value);
            }
          }}
        >
          <SelectTrigger
            id={id}
            aria-describedby={`${id}-description`}
            aria-invalid={error}
            className="w-full shrink-0 sm:w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="end">
            {locales.map((value) => (
              <SelectItem key={value} value={value}>
                <span lang={value}>{localeNames[value]}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {e("saveLocale")}
        </p>
      ) : (
        <p role="status" className="text-xs text-muted-foreground">
          {saving
            ? settings("saving")
            : changed
              ? settings("saved")
              : settings("autoSave")}
        </p>
      )}
    </div>
  );
}
