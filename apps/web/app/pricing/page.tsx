import Link from "next/link";
import { Button } from "../../../../packages/ui/components/button";

export const metadata = {
  title: "Pricing",
  description: "Mock pricing for demo purposes only.",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      subtitle: "Template basics",
      features: [
        "Next.js 16 + Tailwind v4",
        "shadcn/ui preconfigured",
        "Turborepo monorepo setup",
        "Landing, Pricing, FAQ pages",
      ],
      cta: "Open Demo",
      href: "/app",
      popular: false,
    },
    {
      name: "Pro",
      price: "$0",
      subtitle: "Most popular (demo)",
      features: [
        "Shared UI package",
        "Clerk auth wiring",
        "Convex backend scaffold",
        "Example env + configs",
      ],
      cta: "Open Demo",
      href: "/app",
      popular: true,
    },
    {
      name: "Teams",
      price: "$0",
      subtitle: "For teams (demo)",
      features: [
        "Workspace-ready conventions",
        "Packages for UI + backend",
        "Scalable task pipelines",
        "Replaceable auth/data providers",
      ],
      cta: "Open Demo",
      href: "/app",
      popular: false,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Mock pricing (example)</h1>
        <p className="mt-3 text-muted-foreground">This page demonstrates a pricing layout. All plans and features are placeholders.</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className={`relative rounded-lg border p-6 shadow-sm ${p.popular ? "ring-2 ring-primary" : ""}`}>
            {p.popular ? (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Popular</span>
            ) : null}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <span className="text-sm text-muted-foreground">{p.subtitle}</span>
            </div>
            <div className="mt-3 text-3xl font-semibold">{p.price}</div>
            <ul className="mt-4 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 size-4 text-primary" aria-hidden="true">
                    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href={p.href}>{p.cta}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

