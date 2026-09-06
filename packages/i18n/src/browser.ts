import {
  type Locale,
  localeCookie,
  type Preference,
  parseLocale,
  parsePreference,
  preferenceCookie,
} from "./index";

const sessionKey = `${localeCookie}-visitor`;
const hintKey = `${localeCookie}-hint`;
export function readBrowserPreference(): Preference | undefined {
  try {
    const preference = parsePreference(
      document.cookie
        .split("; ")
        .find((value) => value.startsWith(`${localeCookie}=`))
        ?.slice(localeCookie.length + 1),
    );
    if (preference) return preference;
  } catch {
    /* A blocked cookie does not block the current session. */
  }
  try {
    const locale = parseLocale(sessionStorage.getItem(sessionKey));
    return locale ? { source: "visitor", locale } : undefined;
  } catch {
    return undefined;
  }
}
export function writeBrowserPreference(preference: Preference): void {
  try {
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store is not available on all supported browsers.
    document.cookie = preferenceCookie(
      preference,
      location.protocol === "https:",
    );
  } catch {
    /* The provider retains the confirmed choice in memory. */
  }
  if (preference.source === "visitor")
    try {
      sessionStorage.setItem(sessionKey, preference.locale);
    } catch {
      /* Storage can be disabled. */
    }
}
export function clearAccountMirror(): void {
  if (readBrowserPreference()?.source !== "account") return;
  try {
    // biome-ignore lint/suspicious/noDocumentCookie: Clear the host-only mirror before sign-out navigation.
    document.cookie = `${localeCookie}=; Path=/; SameSite=Lax; Max-Age=0`;
  } catch {
    /* Never block sign-out on storage. */
  }
}
export function captureLanguageHint(): Locale | undefined {
  const url = new URL(location.href);
  const hint = parseLocale(url.searchParams.get("lang"));
  if (hint)
    try {
      sessionStorage.setItem(hintKey, hint);
    } catch {
      /* The server already supplied the hint. */
    }
  if (url.searchParams.has("lang")) {
    url.searchParams.delete("lang");
    history.replaceState(history.state, "", url);
  }
  try {
    return hint ?? parseLocale(sessionStorage.getItem(hintKey));
  } catch {
    return hint;
  }
}
