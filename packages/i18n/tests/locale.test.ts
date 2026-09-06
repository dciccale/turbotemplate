import { describe, expect, it } from "vitest";
import {
  formatMoney,
  localAppPath,
  negotiateLocale,
  parseDecimal,
  parsePreference,
  preferenceCookie,
  publicPath,
  publicRoute,
  resolveAppLocale,
} from "../src";

describe("browser negotiation", () => {
  it.each([
    ["es-MX, en;q=0.5", "es"],
    ["en-GB,es;q=0.8", "en"],
    ["ES-es;q=0.9,en;q=0.2", "es"],
    ["es;q=0,en;q=0.4", "en"],
    ["*;q=0.5,en;q=0", "es"],
    ["es;q=0.5,en;q=0.5", "en"],
    ["es;q=garbage,en;q=0.3", "en"],
    ["fr", "en"],
    ["es;q=0,en;q=0", "en"],
  ])("%s resolves to %s", (header, expected) =>
    expect(negotiateLocale(header)).toBe(expected),
  );
});
describe("preference ownership", () => {
  it("account preference wins over visitor choice and hint", () =>
    expect(
      resolveAppLocale({
        accountLocale: "en",
        preference: { source: "visitor", locale: "es" },
        hint: "es",
      }),
    ).toBe("en"));
  it("ignores another account's mirror", () =>
    expect(
      resolveAppLocale({
        userId: "second",
        preference: { source: "account", locale: "es", userId: "first" },
        header: "en",
      }),
    ).toBe("en"));
  it("ignores account mirrors after sign-out", () =>
    expect(
      resolveAppLocale({
        preference: { source: "account", locale: "es", userId: "first" },
        header: "en",
      }),
    ).toBe("en"));
  it("distinguishes visitor cookies from account mirrors", () => {
    expect(parsePreference("es")).toEqual({ locale: "es", source: "visitor" });
    expect(parsePreference("fr")).toBeUndefined();
    expect(parsePreference("account:es:alice")).toEqual({
      locale: "es",
      source: "account",
      userId: "alice",
    });
  });
  it("sets the browser cookie contract", () =>
    expect(
      preferenceCookie({ locale: "es", source: "visitor" }, true),
    ).toContain("Path=/; SameSite=Lax; Max-Age=15552000; Secure"));
});
describe("routes", () => {
  it("uses the English home alias only for navigation", () => {
    expect(publicPath("/", "en", true)).toBe("/en");
    expect(publicPath("/", "en")).toBe("/");
  });
  it.each(["/app", "/app/billing", "/es/app", "/es/unknown", "/fr/pricing"])(
    "does not register %s as a public page",
    (path) => expect(publicRoute(path)).toBeUndefined(),
  );
  it.each([
    "https://evil.test/app",
    "//evil.test/app",
    "/app/../../outside",
    "/application",
    "/app\\evil",
  ])("rejects unsafe return destination %s", (path) =>
    expect(localAppPath(path)).toBe("/app"),
  );
  it("preserves safe query parameters and fragments", () =>
    expect(localAppPath("/app/billing?checkout=success#invoice")).toBe(
      "/app/billing?checkout=success#invoice",
    ));
});
describe("formatting", () => {
  it("uses Stripe charge units", () => {
    expect(formatMoney(1200, "jpy", "en")).toBe("¥1,200");
    expect(formatMoney(1200, "usd", "en")).toBe("$12.00");
    expect(formatMoney(1200, "eur", "es")).toContain("12,00");
  });
  it("parses decimal input without accepting grouping ambiguity", () => {
    expect(parseDecimal("12,5", "es")).toBe(12.5);
    expect(parseDecimal("12.5", "en")).toBe(12.5);
    expect(parseDecimal("1,000.5", "en")).toBeUndefined();
  });
});
