"use client";
import { parseDecimal } from "@turbotemplate/i18n";
import { Input } from "@turbotemplate/ui/components/ui/input";
import { useLocale, useTranslations } from "next-intl";
import type { ComponentProps } from "react";
export function DecimalInput(props: ComponentProps<typeof Input>) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  return (
    <Input
      {...props}
      inputMode="decimal"
      onChange={(event) => {
        event.currentTarget.setCustomValidity(
          event.currentTarget.value &&
            parseDecimal(event.currentTarget.value, locale) === undefined
            ? t("invalidNumber")
            : "",
        );
        props.onChange?.(event);
      }}
    />
  );
}
