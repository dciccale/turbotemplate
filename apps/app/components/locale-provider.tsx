"use client";
import { useAuth } from "@clerk/nextjs";
import { api } from "@turbotemplate/backend/api";
import type { Locale, Preference } from "@turbotemplate/i18n";
import {
  captureLanguageHint,
  clearAccountMirror,
  readBrowserPreference,
  writeBrowserPreference,
} from "@turbotemplate/i18n/browser";
import { loadMessages } from "@turbotemplate/i18n/messages";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type LanguageContext = {
  locale: Locale;
  changeLocale: (locale: Locale) => Promise<void>;
  saving: boolean;
  error: boolean;
};
const Context = createContext<LanguageContext | null>(null);
export function useLanguage() {
  const value = useContext(Context);
  if (!value) throw new Error("Language provider missing");
  return value;
}
async function messagesFor(locale: Locale) {
  const { marketing, emails, ...messages } = await loadMessages(locale);
  return messages;
}

export function LocaleProvider({
  children,
  initialLocale,
  initialMessages,
  onLocaleChange,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialMessages: AbstractIntlMessages;
  onLocaleChange: (locale: Locale) => void;
}) {
  const { userId, isLoaded } = useAuth();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const settings = useQuery(api.settings.get, isAuthenticated ? {} : "skip");
  const save = useMutation(api.settings.setLocale);
  const [state, setState] = useState({
    locale: initialLocale,
    messages: initialMessages,
    owner: userId,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [zone, setZone] = useState("UTC");
  const sequence = useRef(0);
  const owner = useRef(userId);
  owner.current = userId;
  const visitor = useRef<Preference | undefined>(undefined);
  const languageHint = useRef<Locale | undefined>(undefined);
  const ready =
    isLoaded && !isLoading && (!userId || settings?.userId === userId);
  const [resolvedOwner, setResolvedOwner] = useState<string | null | undefined>(
    undefined,
  );
  function mirror(locale: Locale) {
    const preference: Preference = userId
      ? { source: "account", locale, userId }
      : { source: "visitor", locale };
    writeBrowserPreference(preference);
    if (!userId) visitor.current = preference;
  }
  useEffect(() => {
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    visitor.current = readBrowserPreference();
    languageHint.current = captureLanguageHint();
  }, []);
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const id = ++sequence.current;
    const capturedOwner = userId;
    const preference = visitor.current ?? readBrowserPreference();
    const fallback =
      preference?.source === "visitor"
        ? preference.locale
        : (languageHint.current ?? initialLocale);
    const locale = settings?.locale ?? fallback;
    if (preference?.source === "account" && preference.userId !== userId)
      clearAccountMirror();
    void (async () => {
      const messages = await messagesFor(locale);
      if (
        cancelled ||
        id !== sequence.current ||
        owner.current !== capturedOwner
      )
        return;
      setState({ locale, messages, owner: capturedOwner });
      onLocaleChange(locale);
      setResolvedOwner(capturedOwner);
      if (userId && settings?.locale)
        writeBrowserPreference({ source: "account", locale, userId });
      else if (userId && preference?.source === "visitor")
        await save({ locale: preference.locale, adoptOnly: true });
    })().catch(() => {
      if (!cancelled) setError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, userId, settings?.locale, initialLocale, save, onLocaleChange]);
  useEffect(() => {
    document.documentElement.lang = state.locale;
  }, [state.locale]);
  async function changeLocale(locale: Locale) {
    if (saving || locale === state.locale) return;
    const id = ++sequence.current;
    const capturedOwner = userId;
    setSaving(true);
    setError(false);
    try {
      const messages = await messagesFor(locale);
      if (userId) await save({ locale });
      if (id !== sequence.current || owner.current !== capturedOwner) return;
      setState({ locale, messages, owner: capturedOwner });
      mirror(locale);
      onLocaleChange(locale);
    } catch {
      if (owner.current === capturedOwner) setError(true);
    } finally {
      if (owner.current === capturedOwner) setSaving(false);
    }
  }
  const show = ready && resolvedOwner === userId && state.owner === userId;
  return (
    <Context.Provider
      value={{ locale: state.locale, changeLocale, saving, error }}
    >
      <NextIntlClientProvider
        locale={state.locale}
        messages={state.messages}
        timeZone={zone}
      >
        {show ? (
          children
        ) : (
          <p role="status" className="p-6">
            {state.locale === "es" ? "Cargando…" : "Loading…"}
          </p>
        )}
      </NextIntlClientProvider>
    </Context.Provider>
  );
}
