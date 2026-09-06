import {
  locales,
  product,
  publicPath,
  publicRoutes,
} from "@turbotemplate/i18n";
import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_MARKETING_URL || product.origin;
  return publicRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: new URL(publicPath(route, locale), origin).href,
      alternates: {
        languages: Object.fromEntries([
          ...locales.map((language) => [
            language,
            new URL(publicPath(route, language), origin).href,
          ]),
          ["x-default", new URL(route, origin).href],
        ]),
      },
    })),
  );
}
