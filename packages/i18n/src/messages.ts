import type { Locale } from "./index";
import type en from "./messages/en.json";

const loaders = {
  en: () => import("./messages/en.json"),
  es: () => import("./messages/es.json"),
};
export async function loadMessages(locale: Locale): Promise<typeof en> {
  const [source, translated] = await Promise.all([
    loaders.en(),
    loaders[locale](),
  ]);
  // Merge at namespace boundaries so a missing runtime message uses source copy.
  return {
    ...source.default,
    ...translated.default,
    common: { ...source.default.common, ...translated.default.common },
    marketing: { ...source.default.marketing, ...translated.default.marketing },
    auth: { ...source.default.auth, ...translated.default.auth },
    dashboard: { ...source.default.dashboard, ...translated.default.dashboard },
    billing: { ...source.default.billing, ...translated.default.billing },
    settings: { ...source.default.settings, ...translated.default.settings },
    errors: { ...source.default.errors, ...translated.default.errors },
    emails: { ...source.default.emails, ...translated.default.emails },
  };
}
