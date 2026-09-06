import { parseLocale } from "@turbotemplate/i18n";
import { Button } from "@turbotemplate/ui/components/ui/button";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
export const generateMetadata = () => pageMetadata("/pricing");
export default async function PricingPage() {
  const t = await getTranslations("marketing");
  const c = await getTranslations("common");
  const locale = parseLocale(await getLocale()) ?? "en";
  const format = await getFormatter();
  const plans = [
    {
      id: "starter",
      name: "Starter",
      features: ["readyDescription", "ui", "sharedDescription", "pages"],
    },
    {
      id: "pro",
      name: "Pro",
      features: ["ui", "authDescription", "configuration"],
    },
    {
      id: "teams",
      name: "Teams",
      features: ["sharedDescription", "pipelines", "providers"],
    },
  ] as const;
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          {t("pricingTitle")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("pricingDescription")}</p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border p-6 shadow-sm ${plan.id === "pro" ? "ring-2 ring-primary" : ""}`}
          >
            {plan.id === "pro" ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                {t("popular")}
              </span>
            ) : null}
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="text-sm text-muted-foreground">{t(plan.id)}</p>
            <div className="mt-3 text-3xl font-semibold">
              {format.number(0, { style: "currency", currency: "USD" })}
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {plan.features.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full">
              <a href={`/app?lang=${locale}`}>{c("openDemo")}</a>
            </Button>
          </div>
        ))}
      </div>
    </main>
  );
}
