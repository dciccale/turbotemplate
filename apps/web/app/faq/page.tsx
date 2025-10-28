export const metadata = {
  title: "FAQ",
  description: "Answers to common questions about turbotemplate",
};

export default function FaqPage() {
  const faqs = [
    {
      q: "What is turbotemplate?",
      a: "A monorepo boilerplate built with Turborepo. It’s designed to kickstart new projects with a working app shell, authentication, data layer, and UI components.",
    },
    {
      q: "What’s included out of the box?",
      a: "Next.js 16, Tailwind CSS v4, shadcn/ui, Clerk for authentication, Convex for the backend, a shared UI package, and a backend package — plus landing, pricing, and FAQ pages.",
    },
    {
      q: "Is this site real or a demo?",
      a: "It’s a demo. The content is mock data intended to showcase structure and wiring.",
    },
    {
      q: "Can I replace Clerk or Convex?",
      a: "Yes. The template aims to be provider-agnostic so you can swap auth or data layers as needed.",
    },
    {
      q: "Can I use turbotemplate for commercial projects?",
      a: "Yes. It’s a starting point for your own apps. Review, harden, and adapt it to your requirements before going to production.",
    },
    {
      q: "Why have pricing and FAQ if it’s a template?",
      a: "To demonstrate common marketing pages and content structure you can customize for your project.",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-center">
        Frequently asked questions
      </h1>
      <div className="mt-10 grid gap-6">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-lg border p-6">
            <h2 className="text-base font-semibold">{f.q}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
