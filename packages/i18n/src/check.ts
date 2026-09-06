import { checkCatalog } from "./catalog";
import { locales } from "./index";
import en from "./messages/en.json";

for (const locale of locales)
  checkCatalog(en, (await import(`./messages/${locale}.json`)).default);
console.info(`Validated ${locales.length} translation catalogs.`);
