import "@turbotemplate/ui/globals.css";
import { parseLocale, product } from "@turbotemplate/i18n";
import { getLocale, getMessages } from "next-intl/server";
import { AppProviders } from "@/components/app-providers";
export const metadata = {
  title: product.name,
  robots: { index: false, follow: false },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = parseLocale(await getLocale()) ?? "en";
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <AppProviders locale={locale} messages={messages}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
