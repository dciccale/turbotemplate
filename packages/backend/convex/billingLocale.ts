import type { Locale } from "@turbotemplate/i18n";
import { localAppPath, product } from "@turbotemplate/i18n";
import { ConvexError } from "convex/values";
export function appReturnUrl(
  value: string,
  origin = process.env.APP_ORIGIN ?? product.origin,
): string {
  try {
    const url = new URL(value);
    const expected = new URL(origin);
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (url.origin !== expected.origin || localAppPath(path) !== path)
      throw new Error("Invalid return URL");
    return url.href;
  } catch {
    throw new ConvexError({ code: "INVALID_RETURN_URL" });
  }
}
export function checkoutLocale(locale: Locale) {
  return { locale };
}
export function portalParameters({
  customerId,
  returnUrl,
  locale,
}: {
  customerId: string;
  returnUrl: string;
  locale: Locale;
}) {
  return { customer: customerId, return_url: appReturnUrl(returnUrl), locale };
}
