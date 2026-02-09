import type { Metadata } from "next";
import "@turbotemplate/ui/globals.css";
import { enUS } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
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
  metadataBase: new URL("https://turbotemplate.com"),
  title: {
    default: "turbotemplate — Turborepo monorepo boilerplate",
    template: "%s — turbotemplate",
  },
  description:
    "A batteries-included Turborepo monorepo template with Next.js 16, Tailwind CSS v4, shadcn/ui, Clerk auth, and a Convex backend. Demo pages included (landing, FAQ, pricing).",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "turbotemplate — Turborepo monorepo boilerplate",
    description:
      "Monorepo template for Next.js 16, Tailwind 4, shadcn/ui, Clerk, and Convex. Mock site for demo purposes.",
    type: "website",
    url: "https://turbotemplate-web.vercel.app",
    siteName: "turbotemplate",
  },
  twitter: {
    card: "summary_large_image",
    title: "turbotemplate — Turborepo monorepo boilerplate",
    description:
      "Monorepo template with Next.js 16, Tailwind 4, shadcn/ui, Clerk, and Convex.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || "/";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl={marketingUrl}
      signInUrl="/app/sign-in"
      signUpUrl="/app/sign-up"
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
      localization={enUS}
      appearance={{
        baseTheme: shadcn,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="turbotemplate-theme"
          >
            <SiteHeader />
            {children}
            <SiteFooter />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
