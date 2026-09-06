import { parseLocale, publicPath } from "@turbotemplate/i18n";
import { getLocale, getTranslations } from "next-intl/server";
export default async function NotFound() {
  const t = await getTranslations("common");
  const locale = parseLocale(await getLocale()) ?? "en";
  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="text-3xl font-semibold">{t("notFound")}</h1>
      <a
        href={publicPath("/", locale, true)}
        className="mt-6 inline-block underline"
      >
        {t("backHome")}
      </a>
    </main>
  );
}
