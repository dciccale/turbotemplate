import { parseLocale, product } from "@turbotemplate/i18n";
import { Badge } from "@turbotemplate/ui/components/ui/badge";
import { Button } from "@turbotemplate/ui/components/ui/button";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Code2,
  CreditCard,
  Database,
  Folder,
  Globe2,
  Layers3,
  LockKeyhole,
  Terminal,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { GitHubIcon } from "@/components/github-icon";
import { pageMetadata } from "@/i18n/metadata";
import { cloneCommand, repositoryUrl } from "@/lib/project";
export const generateMetadata = () => pageMetadata("/");
const features = [
  { key: "shared", icon: Layers3, tech: "Turborepo + Bun" },
  { key: "ready", icon: Code2, tech: "Next.js + shadcn/ui" },
  { key: "auth", icon: LockKeyhole, tech: "Clerk" },
  { key: "data", icon: Database, tech: "Convex" },
  { key: "billing", icon: CreditCard, tech: "Stripe + React Email" },
  { key: "languages", icon: Globe2, tech: "next-intl" },
] as const;
export default async function Home() {
  const t = await getTranslations("marketing");
  const c = await getTranslations("common");
  const locale = parseLocale(await getLocale()) ?? "en";
  return (
    <main>
      <section className="marketing-hero relative overflow-hidden border-b">
        <div className="marketing-container relative grid items-center gap-14 py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-28">
          <div>
            <Badge
              variant="outline"
              className="gap-2 rounded-full border-emerald-600/25 bg-background/80 px-3 py-1.5 font-mono text-[11px] font-normal tracking-wide"
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {t("badge")}
            </Badge>
            <h1 className="mt-7 max-w-2xl text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl xl:text-7xl">
              {t("heroLead")}
              <br />
              <span className="text-emerald-700 dark:text-emerald-400">
                {t("heroAccent")}
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              {t("homeDescription")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-11 gap-2 px-5">
                <a href={repositoryUrl}>
                  <GitHubIcon />
                  {t("getTemplate")}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="h-11 gap-2 px-5">
                <a href={`/app?lang=${locale}`}>
                  {c("openDemo")}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              {t("ownership")}
            </p>
          </div>
          <div className="repo-window relative min-w-0 overflow-hidden rounded-xl border bg-background shadow-2xl shadow-emerald-950/10 dark:shadow-black/40">
            <div className="flex items-center justify-between border-b bg-muted/50 px-5 py-3.5">
              <div aria-hidden="true" className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-foreground/20" />
                <span className="size-2.5 rounded-full bg-foreground/15" />
                <span className="size-2.5 rounded-full bg-foreground/10" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {product.name}
              </span>
              <GitHubIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-2 font-mono text-sm">
                <Folder className="size-4 text-emerald-600 dark:text-emerald-400" />
                {product.name}
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {t("repoLabel")}
                </span>
              </div>
              <div className="space-y-5 border-l border-dashed pl-5 font-mono text-sm">
                {(
                  [
                    ["apps/web", "treeWeb"],
                    ["apps/app", "treeApp"],
                    ["packages/ui", "treeUi"],
                    ["packages/backend", "treeBackend"],
                    ["packages/i18n", "treeI18n"],
                    ["packages/emails", "treeEmails"],
                  ] as const
                ).map(([path, key]) => (
                  <div
                    key={path}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"
                  >
                    <span>{path}</span>
                    <span className="text-xs text-muted-foreground">
                      {t(key)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t bg-emerald-500/5 px-6 py-5 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {"❯"}
                </span>
                <span>{"bun run dev"}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                <span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {"✓"}
                  </span>{" "}
                  {"web :3000"}
                </span>
                <span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {"✓"}
                  </span>{" "}
                  {"app :3001"}
                </span>
                <span className="ml-auto">{t("buildSomething")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-b bg-muted/25">
        <div className="marketing-container flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-7 lg:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t("stackLabel")}
          </p>
          {[
            "Next.js",
            "Turborepo",
            "TypeScript",
            "shadcn/ui",
            "Convex",
            "Clerk",
            "Stripe",
          ].map((name) => (
            <span
              key={name}
              className="text-sm font-semibold tracking-tight text-foreground/70"
            >
              {name}
            </span>
          ))}
        </div>
      </section>
      <section
        id="features"
        className="marketing-container scroll-mt-24 py-20 sm:py-24"
      >
        <div className="mb-10 grid gap-5 md:grid-cols-2 md:items-end">
          <div>
            <p className="section-label">{t("included")}</p>
            <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("featuresHeading")}
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground md:justify-self-end">
            {t("featuresIntro")}
          </p>
        </div>
        <div className="grid overflow-hidden rounded-xl border bg-border gap-px sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ key, icon: Icon, tech }) => (
            <article
              key={key}
              className="group bg-background p-7 transition-colors hover:bg-muted/70 sm:p-8"
            >
              <div className="mb-7 flex items-center justify-between">
                <Icon
                  className="size-5 text-emerald-700 dark:text-emerald-400"
                  strokeWidth={1.5}
                />
                <span className="font-mono text-[10px] text-muted-foreground">
                  {tech}
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight">
                {t(`${key}Title`)}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t(`${key}Description`)}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section
        id="start"
        className="marketing-container scroll-mt-24 pb-20 sm:pb-24"
      >
        <div className="grid gap-10 rounded-xl border bg-muted/30 p-7 sm:p-10 lg:grid-cols-2 lg:p-12">
          <div>
            <p className="section-label">{t("startLabel")}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("startTitle")}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              {t("startDescription")}
            </p>
            <a
              href={`${repositoryUrl}#readme`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
            >
              {t("readGuide")}
              <ArrowUpRight className="size-4" />
            </a>
          </div>
          <div className="min-w-0 self-center overflow-hidden rounded-lg border bg-background">
            <div className="flex items-center gap-2 border-b px-5 py-3 text-xs text-muted-foreground">
              <Terminal className="size-4" />
              {t("terminal")}
            </div>
            <pre className="overflow-x-auto p-5 text-xs leading-7 sm:text-sm">
              <code>
                <span className="text-muted-foreground">
                  {t("cloneComment")}
                </span>
                {"\n"}
                {cloneCommand}
                {"\n\n"}
                <span className="text-muted-foreground">
                  {t("installComment")}
                </span>
                {"\n"}
                {"cd my-project\nbun install"}
              </code>
            </pre>
          </div>
        </div>
      </section>
      <section id="faq" className="marketing-container scroll-mt-24 pb-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="section-label">{t("faq")}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              {t("faqTitle")}
            </h2>
          </div>
          <div className="border-t">
            {([1, 2, 3, 4] as const).map((index) => (
              <details key={index} className="group border-b py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {t(`q${index}`, { brand: product.name })}
                  <ArrowDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                  {t(`a${index}`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t bg-emerald-500/5">
        <div className="marketing-container flex flex-col items-start justify-between gap-6 py-14 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("closingTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("closingDescription")}
            </p>
          </div>
          <Button asChild className="h-11 gap-2 px-5">
            <a href={repositoryUrl}>
              <GitHubIcon />
              {t("viewGithub")}
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
