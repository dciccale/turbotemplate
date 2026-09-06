import { isLocale } from "@turbotemplate/i18n";
import { notFound } from "next/navigation";
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  if (!isLocale((await params).locale)) notFound();
  return children;
}
