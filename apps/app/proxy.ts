import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  localeCookie,
  parseLocale,
  parsePreference,
  resolveAppLocale,
} from "@turbotemplate/i18n";
import type { NextFetchEvent } from "next/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/app/sign-in(.*)",
  "/app/sign-up(.*)",
]);

const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect signed-in users away from sign-in/sign-up pages
  if (userId && isPublicRoute(req)) {
    const target = new URL("/app", req.url);
    const hint = parseLocale(req.nextUrl.searchParams.get("lang"));
    if (hint) target.searchParams.set("lang", hint);
    return NextResponse.redirect(target);
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete("x-app-language-hint");
  const hint = parseLocale(req.nextUrl.searchParams.get("lang"));
  if (hint) requestHeaders.set("x-app-language-hint", hint);
  const preference = parsePreference(req.cookies.get(localeCookie)?.value);
  const locale = resolveAppLocale({
    preference: preference?.source === "visitor" ? preference : undefined,
    hint,
    header: req.headers.get("accept-language"),
  });
  const clerkRes = await clerk(
    new NextRequest(req, { headers: requestHeaders }),
    event,
  );

  // Clerk uses NextResponse.rewrite(req.url) to forward auth headers to the
  // page handler. In Next.js 16 this creates an infinite rewrite loop because
  // the proxy re-invokes the middleware for the rewritten URL.
  //
  // Fix: replace the rewrite with NextResponse.next() while copying all the
  // x-middleware-request-* and x-middleware-override-headers that Clerk set.
  if (clerkRes?.headers?.has("x-middleware-rewrite")) {
    const next = NextResponse.next();

    // Copy every Clerk header except x-middleware-rewrite
    for (const [key, value] of clerkRes.headers.entries()) {
      if (key === "x-middleware-rewrite") continue;
      next.headers.set(key, value);
    }

    next.headers.set("Content-Language", locale);
    return next;
  }

  if (clerkRes) clerkRes.headers.set("Content-Language", locale);
  return clerkRes;
}

export const config = {
  matcher: [
    // Match the root path (basePath-stripped "/" i.e. /app)
    "/",
    // Match all routes except static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
