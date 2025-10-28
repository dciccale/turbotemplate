import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@turbotemplate/ui/components/alert";
import { Badge } from "@turbotemplate/ui/components/badge";
import { Button } from "@turbotemplate/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@turbotemplate/ui/components/card";
import {
  BarChart3,
  MessageSquare,
  Rocket,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="pt-14 sm:pt-20 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="gap-1.5">
            <Rocket className="size-3.5" />
            Turborepo monorepo template
          </Badge>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            turbotemplate — a full‑stack monorepo boilerplate
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            A demo‑ready template for future projects and startup ideas.
            Preconfigured with Next.js 16, Tailwind CSS v4, shadcn/ui, Clerk
            authentication, and a Convex backend — all wired up in a Turborepo
            monorepo with shared UI and backend packages.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/app">Open Demo</Link>
            </Button>
            <Link
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              See what’s included
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            This site uses mock copy and placeholder content for demo purposes.
          </p>
        </div>
      </section>

      {/* Alert */}
      <section className="mt-16 sm:mt-20">
        <div className="mx-auto max-w-3xl">
          <Alert>
            <Sparkles />
            <AlertTitle>Template, not a product</AlertTitle>
            <AlertDescription>
              turbotemplate is a starter kit to speed up new ideas. It ships
              with a working app shell, auth, data, and example pages so you can
              focus on building.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="features" className="mt-12 sm:mt-16">
        <h2 id="features" className="sr-only">
          Features
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Rocket className="size-5" />
                </div>
                <CardTitle>Monorepo, shared packages</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Turborepo workspace with a shared UI package and a backend
                package powered by Convex.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <CardTitle>Batteries included</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Next.js 16, Tailwind CSS v4, and shadcn/ui preconfigured with
                sensible defaults.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="size-5" />
                </div>
                <CardTitle>Auth & data ready</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Clerk authentication and Convex backend scaffolding already
                wired together.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mt-20 sm:mt-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Mock pricing (example)
          </h2>
          <p className="mt-3 text-muted-foreground">
            Example pricing cards included for demo only.
          </p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>Template basics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">$0</div>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-muted-foreground" />
                  Next.js 16 + Tailwind CSS v4
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  shadcn/ui components
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="size-4 text-muted-foreground" />
                  Turborepo monorepo setup
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/app">Open Demo</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>More included</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                $0
                <span className="text-base font-normal text-muted-foreground">
                  /demo
                </span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-muted-foreground" />
                  Shared UI package
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="size-4 text-muted-foreground" />
                  Clerk auth wired up
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="size-4 text-muted-foreground" />
                  Convex backend scaffold
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/app">Open Demo</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="my-20 sm:my-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-center">
            Frequently asked questions
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                q: "What is turbotemplate?",
                a: "A Turborepo-based monorepo boilerplate for quickly starting new projects with a working web app, auth, data, and UI components.",
              },
              {
                q: "What’s included?",
                a: "Next.js 16, Tailwind CSS v4, shadcn/ui, Clerk authentication, Convex backend, a shared UI package, a backend package, and example pages (landing, pricing, FAQ).",
              },
              {
                q: "Is this production ready?",
                a: "It’s a starter template with mock content intended for demos and rapid prototyping. Review and harden before production.",
              },
              {
                q: "Can I swap providers?",
                a: "Yes. You can replace Clerk or Convex with your preferred auth/data stack. The structure aims to make swaps straightforward.",
              },
            ].map((f) => (
              <Card key={f.q}>
                <CardHeader>
                  <CardTitle className="text-base">{f.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{f.a}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
