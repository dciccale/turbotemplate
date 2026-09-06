"use client";
import { useTranslations } from "next-intl";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("errors");
  const c = useTranslations("common");
  return (
    <main className="p-6">
      <h1 role="alert">{t("generic")}</h1>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md border px-4 py-2"
      >
        {c("retry")}
      </button>
    </main>
  );
}
