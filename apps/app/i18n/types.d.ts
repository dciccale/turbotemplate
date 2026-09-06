import type { Locale } from "@turbotemplate/i18n";
import type en from "@turbotemplate/i18n/messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof en;
  }
}
