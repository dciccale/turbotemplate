import {
  localeCookie,
  parseLocale,
  publicPath,
  publicRoute,
} from "@turbotemplate/i18n";
import { type NextRequest, NextResponse } from "next/server";
export function GET(request: NextRequest) {
  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  if (!locale) return new NextResponse(null, { status: 400 });
  const target = new URL(
    request.nextUrl.searchParams.get("next") || publicPath("/", locale, true),
    request.url,
  );
  const resolved =
    target.origin === request.nextUrl.origin
      ? publicRoute(target.pathname)
      : undefined;
  const destination = request.nextUrl.clone();
  destination.pathname = publicPath(resolved?.route ?? "/", locale, true);
  destination.search = resolved ? target.search : "";
  destination.hash = resolved ? target.hash : "";
  const response = NextResponse.redirect(destination, 303);
  response.cookies.set(localeCookie, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 15552000,
    secure: request.nextUrl.protocol === "https:",
  });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
