import Negotiator from "negotiator";

export const product = {
  name: "turbotemplate",
  cookiePrefix: "turbotemplate",
  origin: "https://turbotemplate.com",
};
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const localeNames = { en: "English", es: "Español" };
export const formatLocales = { en: "en-US", es: "es-ES" };
export const timeZone = "UTC";
export const localeCookie = `${product.cookiePrefix}-locale`;
export const publicRoutes = ["/", "/pricing", "/faq"] as const;
export type PublicRoute = (typeof publicRoutes)[number];
export function isLocale(value: unknown): value is Locale {
  return locales.some((locale) => locale === value);
}
export function parseLocale(value: unknown): Locale | undefined {
  return isLocale(value) ? value : undefined;
}
export function negotiateLocale(header: string | null | undefined): Locale {
  // Negotiator handles quality, exclusions, regional matches and wildcard priority.
  const normalized = (header ?? "")
    .toLowerCase()
    .split(",")
    .filter((entry) =>
      /^\s*(?:[a-z]{1,8}(?:-[a-z0-9]{1,8})*|\*)(?:\s*;\s*q=(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?))?\s*$/.test(
        entry,
      ),
    )
    .sort((a, b) => {
      const rank = (entry: string) => {
        const language = entry.trim().split(/[;-]/)[0];
        const index = isLocale(language) ? locales.indexOf(language) : -1;
        return index < 0 ? locales.length : index;
      };
      return rank(a) - rank(b);
    })
    .join(",");
  return (
    parseLocale(
      new Negotiator({ headers: { "accept-language": normalized } }).language([
        ...locales,
      ]),
    ) ?? defaultLocale
  );
}
export type Preference =
  | { locale: Locale; source: "visitor" }
  | { locale: Locale; source: "account"; userId: string };
export function parsePreference(
  value: string | undefined,
): Preference | undefined {
  if (isLocale(value)) return { locale: value, source: "visitor" };
  const [source, locale, userId, extra] = (value ?? "").split(":");
  if (source === "account" && isLocale(locale) && userId && !extra)
    return { source, locale, userId };
  return undefined;
}
export function serializePreference(preference: Preference): string {
  return preference.source === "visitor"
    ? preference.locale
    : `account:${preference.locale}:${preference.userId}`;
}
export function resolveAppLocale({
  accountLocale,
  preference,
  hint,
  header,
  userId,
}: {
  accountLocale?: unknown;
  preference?: Preference;
  hint?: unknown;
  header?: string | null;
  userId?: string | null;
}): Locale {
  const cookie =
    preference?.source === "visitor" ||
    (userId && preference?.source === "account" && preference.userId === userId)
      ? preference.locale
      : undefined;
  return (
    parseLocale(accountLocale) ??
    cookie ??
    parseLocale(hint) ??
    negotiateLocale(header)
  );
}
export function publicPath(
  route: PublicRoute,
  locale: Locale,
  navigation = false,
): string {
  if (locale === defaultLocale)
    return route === "/" && navigation ? `/${locale}` : route;
  return `/${locale}${route === "/" ? "" : route}`;
}
export function publicRoute(
  pathname: string,
): { route: PublicRoute; locale: Locale } | undefined {
  for (const locale of locales)
    for (const route of publicRoutes) {
      if (
        pathname === publicPath(route, locale) ||
        pathname === `/${locale}${route === "/" ? "" : route}`
      )
        return { route, locale };
    }
  return undefined;
}
export function localAppPath(value: string | undefined): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: Reject URL control characters at this external boundary.
  if (!value || /[\\\x00-\x20]/.test(value)) return "/app";
  try {
    const url = new URL(value, "https://local.invalid");
    if (
      url.origin !== "https://local.invalid" ||
      !(url.pathname === "/app" || url.pathname.startsWith("/app/"))
    )
      return "/app";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/app";
  }
}
export function preferenceCookie(
  preference: Preference,
  secure: boolean,
): string {
  return `${localeCookie}=${serializePreference(preference)}; Path=/; SameSite=Lax; Max-Age=15552000${secure ? "; Secure" : ""}`;
}
// Stripe represents these charge currencies without decimal minor units. ISK and UGX use two API decimals.
const zeroDecimalCurrencies = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);
export function formatMoney(
  amount: number,
  currency: string,
  locale: Locale,
): string {
  return new Intl.NumberFormat(formatLocales[locale], {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(
    amount / (zeroDecimalCurrencies.has(currency.toLowerCase()) ? 1 : 100),
  );
}
export function parseDecimal(
  value: string,
  locale: Locale,
): number | undefined {
  const separator = locale === "es" ? "," : ".";
  const normalized = value.trim().replace(separator, ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return undefined;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : undefined;
}
