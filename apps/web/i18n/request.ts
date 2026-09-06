import { parseLocale } from "@turbotemplate/i18n";
import { loadMessages } from "@turbotemplate/i18n/messages";
import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
export default getRequestConfig(async () => {
  const locale = parseLocale((await headers()).get("x-site-locale")) ?? "en";
  const { common, marketing, errors } = await loadMessages(locale);
  return { locale, timeZone: "UTC", messages: { common, marketing, errors } };
});
