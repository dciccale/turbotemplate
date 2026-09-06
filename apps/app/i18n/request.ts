import { auth } from "@clerk/nextjs/server";
import {
  localeCookie,
  parsePreference,
  resolveAppLocale,
} from "@turbotemplate/i18n";
import { loadMessages } from "@turbotemplate/i18n/messages";
import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
export default getRequestConfig(async () => {
  const [store, requestHeaders, { userId }] = await Promise.all([
    cookies(),
    headers(),
    auth(),
  ]);
  const preference = parsePreference(store.get(localeCookie)?.value);
  const locale = resolveAppLocale({
    preference: preference?.source === "visitor" ? preference : undefined,
    hint: requestHeaders.get("x-app-language-hint"),
    header: requestHeaders.get("accept-language"),
    userId,
  });
  const { marketing, emails, ...messages } = await loadMessages(locale);
  return { locale, messages, timeZone: "UTC" };
});
