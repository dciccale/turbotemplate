import {
  locales,
  type PublicRoute,
  parseLocale,
  product,
  publicPath,
} from "@turbotemplate/i18n";
import { getLocale, getTranslations } from "next-intl/server";
export async function pageMetadata(route: PublicRoute) {
  const locale = parseLocale(await getLocale()) ?? "en";
  const t = await getTranslations("marketing");
  const key = route === "/" ? "home" : route === "/faq" ? "faq" : "pricing";
  const title = t(`${key}Title`, { brand: product.name });
  const description = t(`${key}Description`, { brand: product.name });
  return {
    title,
    description,
    alternates: {
      canonical: publicPath(route, locale),
      languages: {
        ...Object.fromEntries(
          locales.map((language) => [language, publicPath(route, language)]),
        ),
        "x-default": route,
      },
    },
    openGraph: {
      title,
      description,
      url: publicPath(route, locale),
      siteName: product.name,
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website" as const,
    },
    twitter: { card: "summary" as const, title, description },
  };
}
