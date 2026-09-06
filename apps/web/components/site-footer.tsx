import { parseLocale, product, publicPath } from "@turbotemplate/i18n";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { repositoryUrl } from "@/lib/project";
import { GitHubIcon } from "./github-icon";
export async function SiteFooter() {
  const t = await getTranslations("marketing");
  const locale = parseLocale(await getLocale()) ?? "en";
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="font-semibold">{product.name}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("footerDescription")}
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold">{t("product")}</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`${publicPath("/", locale, true)}#features`}>
                  {t("features")}
                </Link>
              </li>
              <li>
                <Link href={`${publicPath("/", locale, true)}#start`}>
                  {t("getStarted")}
                </Link>
              </li>
              <li>
                <Link href={publicPath("/faq", locale)}>{t("faq")}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold">{t("company")}</h2>
            <a
              href={repositoryUrl}
              className="inline-flex items-center gap-2 text-sm hover:underline"
            >
              <GitHubIcon />
              {t("github")}
            </a>
            <p className="mt-2 text-sm text-muted-foreground">{t("contact")}</p>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold">{t("legal")}</h2>
            <p className="text-sm text-muted-foreground">{t("privacy")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("terms")}</p>
          </div>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          {t("rights", {
            year: new Date().getUTCFullYear(),
            brand: product.name,
          })}
        </p>
      </div>
    </footer>
  );
}
