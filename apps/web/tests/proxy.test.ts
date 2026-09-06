import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { expect, it } from "vitest";
import proxy, { config } from "../proxy";

function request(
  path: string,
  headers: Record<string, string> = {},
  method = "GET",
) {
  return new NextRequest(`https://example.com${path}`, { headers, method });
}
it("detects only the home URL and preserves query parameters", () => {
  const response = proxy(
    request("/?campaign=test", { "accept-language": "es-MX" }),
  );
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe(
    "https://example.com/es?campaign=test",
  );
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("vary")).toContain("Cookie");
  expect(response.cookies.getAll()).toEqual([]);
});
it("cookie preference wins at home", () => {
  const response = proxy(
    request("/", {
      "accept-language": "es",
      cookie: "turbotemplate-locale=en",
    }),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("content-language")).toBe("en");
});
it.each([
  ["/pricing", "es", "en"],
  ["/es/pricing", "en", "es"],
  ["/en", "es", "en"],
])("%s uses URL language", (path, cookie, locale) => {
  const response = proxy(
    request(path, {
      cookie: `turbotemplate-locale=${cookie}`,
      "accept-language": "es",
    }),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("content-language")).toBe(locale);
});
it("canonicalizes redundant English prefixes permanently", () => {
  const response = proxy(request("/en/faq?q=one"));
  expect(response.status).toBe(308);
  expect(response.headers.get("location")).toBe(
    "https://example.com/faq?q=one",
  );
});
it.each(["POST", "PUT", "DELETE"])("never redirects %s", (method) =>
  expect(
    proxy(request("/", { "accept-language": "es" }, method)).headers.get(
      "location",
    ),
  ).toBeNull(),
);
it.each(["next-action", "rsc", "next-router-prefetch"])(
  "does not negotiate framework requests: %s",
  (header) =>
    expect(
      proxy(
        request("/", { "accept-language": "es", [header]: "1" }),
      ).headers.get("location"),
    ).toBeNull(),
);
it.each([
  "/app",
  "/app/billing",
  "/app/sign-in",
  "/api/test",
  "/_next/static/test.js",
  "/favicon.ico",
])("excludes %s from the real proxy matcher", (url) =>
  expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(
    false,
  ),
);

import { GET as chooseLanguage } from "../app/language/route";

it("saves explicit choices and preserves the equivalent page without JavaScript", () => {
  const response = chooseLanguage(
    request(
      "/language?locale=es&next=%2Fes%2Fpricing%3Fcampaign%3Dtest%23plans",
    ),
  );
  expect(response.status).toBe(303);
  expect(response.headers.get("location")).toBe(
    "https://example.com/es/pricing?campaign=test#plans",
  );
  expect(response.cookies.get("turbotemplate-locale")?.value).toBe("es");
});
it("does not redirect language choices to an external origin", () => {
  const response = chooseLanguage(
    request("/language?locale=es&next=https%3A%2F%2Fevil.example%2Fes"),
  );
  expect(response.headers.get("location")).toBe("https://example.com/es");
});
