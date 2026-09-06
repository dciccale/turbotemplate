import {
  localeCookie,
  negotiateLocale,
  parseLocale,
  parsePreference,
  publicPath,
  publicRoute,
} from "@turbotemplate/i18n";
import { type NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/app" || pathname.startsWith("/app/"))
    return NextResponse.next();
  const resolved = publicRoute(pathname);
  if (!resolved) {
    const locale = parseLocale(pathname.split("/")[1]) ?? "en";
    const headers = new Headers(request.headers);
    headers.set("x-site-locale", locale);
    headers.set("x-public-search", request.nextUrl.search);
    const response = NextResponse.next({ request: { headers } });
    response.headers.set("Content-Language", locale);
    return response;
  }
  const safe =
    ["GET", "HEAD"].includes(request.method) &&
    !request.headers.has("next-action") &&
    !request.headers.has("rsc") &&
    !request.headers.has("next-router-prefetch");
  const homeDetection = pathname === "/" && safe;
  let locale = resolved.locale;
  if (homeDetection)
    locale =
      parsePreference(request.cookies.get(localeCookie)?.value)?.locale ??
      negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  let response: NextResponse;
  if (homeDetection && locale !== "en") {
    url.pathname = publicPath("/", locale);
    response = NextResponse.redirect(url, 307);
  } else if (safe && pathname.startsWith("/en/")) {
    url.pathname = publicPath(resolved.route, "en");
    response = NextResponse.redirect(url, 308);
  } else {
    url.pathname = `/${locale}${resolved.route === "/" ? "" : resolved.route}`;
    const headers = new Headers(request.headers);
    headers.set("x-site-locale", locale);
    headers.set("x-public-search", request.nextUrl.search);
    response = NextResponse.rewrite(url, { request: { headers } });
  }
  response.headers.set("Content-Language", locale);
  if (homeDetection) {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Accept-Language, Cookie");
  }
  return response;
}
export const config = {
  matcher: ["/", "/en", "/es", "/pricing", "/faq", "/en/:path*", "/es/:path*"],
};
