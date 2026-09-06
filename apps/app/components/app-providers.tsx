"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { type Locale, product } from "@turbotemplate/i18n";
import { clerkLocales } from "@turbotemplate/i18n/clerk";
import { TooltipProvider } from "@turbotemplate/ui/components/ui/tooltip";
import { ThemeProvider } from "@turbotemplate/ui/providers/theme-provider";
import type { AbstractIntlMessages } from "next-intl";
import { type ReactNode, useState } from "react";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { LocaleProvider } from "./locale-provider";
import { LocalizedToaster } from "./localized-toaster";
export function AppProviders({
  children,
  locale: initialLocale,
  messages,
}: {
  children: ReactNode;
  locale: Locale;
  messages: AbstractIntlMessages;
}) {
  const [locale, setLocale] = useState(initialLocale);
  return (
    <ClerkProvider
      afterSignOutUrl={process.env.NEXT_PUBLIC_MARKETING_URL || "/"}
      signInUrl="/app/sign-in"
      signUpUrl="/app/sign-up"
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
      localization={clerkLocales[locale]}
      appearance={{ theme: shadcn }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey={`${product.cookiePrefix}-theme`}
        disableTransitionOnChange
      >
        <TooltipProvider>
          <ConvexClientProvider>
            <LocaleProvider
              initialLocale={initialLocale}
              initialMessages={messages}
              onLocaleChange={setLocale}
            >
              {children}
              <LocalizedToaster />
            </LocaleProvider>
          </ConvexClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
