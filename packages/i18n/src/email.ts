import { IntlMessageFormat } from "intl-messageformat";
import { formatLocales, type Locale } from "./index";
import en from "./messages/en.json";
import es from "./messages/es.json";

const catalogs = { en: en.emails, es: es.emails };
export function emailText(locale: Locale) {
  return (
    key: keyof typeof en.emails,
    values?: Record<string, string | number>,
  ) =>
    new IntlMessageFormat(catalogs[locale][key], formatLocales[locale])
      .format(values)
      .toString();
}
