import { product } from "@turbotemplate/i18n";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "@turbotemplate/ui/globals.css";
import "./marketing.css";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { clerkLocales } from "@turbotemplate/i18n/clerk";
import { ThemeProvider } from "@turbotemplate/ui/providers/theme-provider";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_MARKETING_URL || product.origin,
  ),
  title: { default: product.name, template: `%s — ${product.name}` },
};

const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || "/";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const search = (await headers()).get("x-public-search") ?? "";
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl={marketingUrl}
      signInUrl="/app/sign-in"
      signUpUrl="/app/sign-up"
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
      localization={clerkLocales[locale]}
      appearance={{
        theme: shadcn,
      }}
    >
      <html lang={locale} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey={`${product.cookiePrefix}-theme`}
          >
            <NextIntlClientProvider>
              <SiteHeader search={search} />
              {children}
              <SiteFooter />
            </NextIntlClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
