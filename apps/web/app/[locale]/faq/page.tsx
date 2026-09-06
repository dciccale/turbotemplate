import { product } from "@turbotemplate/i18n";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
export const generateMetadata = () => pageMetadata("/faq");
export default async function FaqPage() {
  const t = await getTranslations("marketing");
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-center text-3xl font-semibold sm:text-4xl">
        {t("faqTitle")}
      </h1>
      <div className="mt-10 grid gap-6">
        {([1, 2, 3, 4, 5, 6] as const).map((index) => (
          <div key={index} className="rounded-lg border p-6">
            <h2 className="font-semibold">
              {t(`q${index}`, { brand: product.name })}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(`a${index}`)}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
