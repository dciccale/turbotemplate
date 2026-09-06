import { expect, it, vi } from "vitest";
import {
  appReturnUrl,
  checkoutLocale,
  portalParameters,
} from "./billingLocale";

it.each(["en", "es"] as const)(
  "captures %s for both vendor sessions",
  (locale) => {
    vi.stubEnv("APP_ORIGIN", "https://example.com");
    expect(checkoutLocale(locale)).toEqual({ locale });
    expect(
      portalParameters({
        locale,
        customerId: "cus_owned",
        returnUrl: "https://example.com/app/billing",
      }),
    ).toEqual({
      customer: "cus_owned",
      return_url: "https://example.com/app/billing",
      locale,
    });
    vi.unstubAllEnvs();
  },
);
it.each([
  "https://evil.example/app",
  "https://example.com/outside",
  "https://example.com/app/../../outside",
])("rejects foreign billing return URLs: %s", (value) =>
  expect(() => appReturnUrl(value, "https://example.com")).toThrow(),
);
it("preserves app return queries", () =>
  expect(
    appReturnUrl(
      "https://example.com/app/billing?checkout=success",
      "https://example.com",
    ),
  ).toBe("https://example.com/app/billing?checkout=success"));
