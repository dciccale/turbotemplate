# Turbotemplate English and Spanish internationalization PRD

Status: Draft for implementation

Updated: 2026-09-06

Scope: SaaS template website, application, authentication, billing, emails, and generated projects

## Outcome

A new project created from Turbotemplate includes complete English and Spanish support. Developers can add product features without rebuilding language detection, preferences, routing, or translation checks.

Internationalization, or i18n, means that code supports multiple languages. This release includes translated starter content as well as the supporting code. English is the source language and fallback. Spanish uses natural Spain-oriented product copy. Language identifiers are `en` and `es`. Default formatting locales are `en-US` and `es-ES`.

The website uses localized public URLs. The app uses the same URLs in both languages. These are proposed requirements, not descriptions of an implemented feature.

## Current state

The repository review on 2026-09-06 found the following:

| Area | Observed state | Required change |
| --- | --- | --- |
| Website | `apps/web` has home, pricing, and FAQ pages with embedded English copy. | Translate existing pages and shared navigation. |
| Routing | The website forwards `/app` and its descendants through `APP_ORIGIN`. `apps/app` has `basePath: "/app"`. | Preserve the boundary between both Next.js apps. |
| App | Existing routes include the dashboard, billing, sign-in, and sign-up. | Translate these routes and add language settings. |
| Auth | Both root layouts hard-code Clerk `enUS` and HTML `lang="en"`. | Resolve both from the active language. |
| Preferences | Convex `settings` stores `userId`, `theme`, and `updatedAt`. | Extend this table with optional language preference. |
| Billing | `packages/backend/convex/stripe.ts` creates checkout and portal sessions. The billing UI contains English labels and browser-default formatting. | Carry the resolved language through billing and format values explicitly. |
| Emails | A React Email welcome template and a Convex send action exist. | Translate the subject and body and pass language into the send operation. |
| Project creation | `bin/create.sh` copies files and replaces lowercase `turbotemplate` strings with the project name. | Include i18n assets and verify names, imports, cookie keys, and branding after project creation. |
| Metadata | Website metadata mixes production and Vercel origins. App metadata still says Create Next App. | Add localized metadata with one configured public origin and product name. |

Neither app currently declares `next-intl`. Legal links in the website footer are placeholders. No legal document routes were found in the reviewed page tree.

Evidence comes from both app layouts and Next.js configs, `packages/backend/convex/schema.ts`, `apps/app/components/dashboard-billing-section.tsx`, and `bin/create.sh`.

## Scope and success criteria

The release covers all shipped starter interfaces:

- Website home, pricing, FAQ, navigation, footer, theme controls, and account entry links.
- Dashboard cards, charts, table controls, filters, pagination, sidebar, and account menu.
- Sign-in, sign-up, recovery states, account controls, and auth redirects.
- Billing catalog, subscription status, cancellation confirmation, invoices, checkout, and customer portal entry.
- A new account settings page and language controls before and after sign-in.
- Toasts, dialogs, validation, tooltips, loading states, empty states, error pages, and accessible names.
- The existing welcome email and the configuration path for vendor-managed email language.
- Project creation, developer instructions, translation checks, and examples that downstream projects can reuse.

Completion requires full reviewed English and Spanish first-party copy in these areas. No required translation key may be missing. A language change must preserve form values, table state, and pending operations. A newly generated project must pass the same i18n checks as the template.

This release does not add product-specific legal documents, additional languages, runtime machine translation, translated user content, native mobile apps, new payment products, or right-to-left layouts. Legal placeholders must remain clearly identifiable as template setup work. Their labels still require translation.

The template supplies language support for existing SaaS features. It must not acquire cycling, class-builder, or other Pedalclass-specific requirements.

## Website routing and detection

| Page | English canonical URL | Spanish canonical URL |
| --- | --- | --- |
| Home | `/` | `/es` |
| Pricing | `/pricing` | `/es/pricing` |
| FAQ | `/faq` | `/es/faq` |

Keep path names unchanged between languages. Public pages added later follow this convention and register their equivalent-language links centrally.

Only `GET` and `HEAD` requests to `/` perform automatic detection. Resolve a valid explicit preference cookie first, then the browser's `Accept-Language` header, then English. If Spanish wins, return a temporary `307` redirect to `/es` and preserve query parameters. Detection must not save an explicit preference.

All other public URLs determine their language. `/pricing` stays English with a Spanish cookie. `/es/pricing` stays Spanish with an English cookie. Visiting a language-specific link does not change the account preference.

Provide `/en` as an explicit English home alias. It serves English even without cookies and uses `/` as its canonical URL. English home navigation uses this alias to prevent repeated browser redirects. Redundant prefixes on other known English routes, such as `/en/pricing`, redirect permanently to their unprefixed equivalent. Unknown language routes return a real 404.

The negotiated home response and its redirects use `Cache-Control: private, no-store` and vary on `Accept-Language` and `Cookie`. Other public page content remains deterministic by URL. A visitor's language must not enter another visitor's cached response.

Never language-redirect POST requests, Server Actions, APIs, webhooks, static files, or framework requests. The website's routing logic must exclude the exact `/app` route and all its descendants. Auth behavior remains the app's responsibility.

The website language switcher displays `English` and `Español`. It uses accessible links that work without JavaScript. It preserves the equivalent page, query parameters, and fragment. Use stable anchor identifiers between translations. The switcher saves a browser preference when cookies are available but does not write account settings.

## App language and persistence

Keep app URLs stable, including `/app`, `/app/billing`, `/app/sign-in`, and `/app/sign-up`. Add `/app/settings` for account preferences. Do not add `/es/app`, `/app/es`, or locale segments to app deep links.

Resolve app language in this order:

1. The authenticated user's explicit `settings.locale`.
2. A valid explicit browser preference cookie.
3. A valid one-time language hint from the website.
4. The browser's `Accept-Language` header.
5. English.

Website account entry links carry `lang=en` or `lang=es`. Validate this hint and preserve it through authentication when no explicit preference exists. Remove it from the visible app URL after resolution. It cannot override a saved account preference. Keep return destinations restricted to valid local app paths.

Add language controls to `/app/settings`, the app account menu, and auth pages. Use language names rather than flags. Show the current selection and any save error in the active language.

For authenticated users, a language change updates `settings.locale` and its cookie mirror. The update derives the user ID from the authenticated identity. It must create a settings record when necessary and preserve the existing theme. If a record needs an initial theme, use the existing system-theme default rather than resetting another preference.

Keep `locale` optional, validated as `en` or `es`. Existing accounts require no forced backfill. On first sign-in, an account without a preference can adopt an explicit visitor choice. Do not save automatically detected browser language as an explicit choice.

Use the browser cookie name `turbotemplate-locale`, derived from shared product configuration. Set `Path=/`, `SameSite=Lax`, a 180-day lifetime, and `Secure` on HTTPS. Use a host-only cookie on the shared website origin. Do not assume cookie sharing across unrelated preview domains.

Distinguish an explicit visitor choice from a cookie mirrored from account settings. Clear the account-derived mirror on sign-out. When the account changes, discard the previous account's resolved language before rendering the next account. Never copy a previous account's cached preference into a new account.

The server response and initial client render must use the same resolved language. Prefer request-time authenticated settings resolution. If client auth is required, hold the app behind a localized loading state until the account preference is known. Do not first display a complete dashboard in the wrong language.

A language change must not reload the document or remount application state. Preserve current route, query parameters, form values, table sorting, filters, pagination, selected rows, open dialogs, and pending requests. Update HTML language, translated copy, and formatters together.

On a failed settings save, retain the previous confirmed preference and show a localized error. Prevent stale responses from replacing a newer selection. With cookies disabled, public URLs still work and a visitor choice persists for the current session. Authenticated users continue to resolve language from settings.

## Browser matching rules

Use a maintained language negotiation parser rather than substring checks. Respect quality weights and exclude `q=0` entries from matching. Match regional variants such as `es-MX` to `es` and `en-GB` to `en`.

Normalize header casing. Ignore malformed entries and invalid cookie values. For equal preferences or wildcards, use the configured locale order, initially English then Spanish, unless a language is explicitly excluded. If no usable match remains, render the default language, English.

Do not detect language from IP address, country, location permission, billing address, currency, or timezone. Browser setting changes apply on later requests and must not interrupt an active session.

## Translation and formatting requirements

Use complete messages with named variables. Support ICU messages, a format for variables, plurals, and conditional text. Do not build sentences by joining translated fragments.

English defines message keys and variable names. Maintain matching Spanish catalogs. Translate system enum labels at display time while retaining original stored values. Demo-owned category labels and statuses require translations. User names, document titles, identifiers, and other user content stay as authored.

Use explicit locale formatters for dates, relative time, numbers, percentages, money, and plural counts. Locale must not change stored values, entitlement rules, invoice amounts, billing periods, or currency. Replace browser-default formatting in billing and dashboard components.

Money formatting must respect Stripe's currency units, including zero-decimal currencies. Do not generalize the current `amount / 100` assumption. Currency conversion and market-based pricing are outside this release.

Language does not determine timezone. Pass the same explicit timezone into server and client formatting. Use UTC until the browser timezone is available for app timestamps, then apply the browser timezone consistently. Calendar-only dates must not move across timezones. Numeric form fields must correctly handle supported decimal input in the selected locale.

Translate accessible names, live announcements, validation, image text that communicates product information, and chart labels. Verify Spanish text expansion on mobile layouts, tables, sidebar items, and confirmation dialogs. Set HTML `lang` and `Content-Language` appropriately.

Backend failures should expose stable error codes and structured parameters. Translate them at the UI boundary. Log technical detail separately. Unexpected errors show a translated generic message, never a raw vendor error or message key.

Shared UI components receive labels, placeholders, accessible names, and empty states from callers. Audit embedded copy in dialogs, sheets, theme controls, table utilities, and charts. Shared UI must not import product catalogs.

## Authentication, billing, and emails

### Clerk

Use a shared locale mapping in both Clerk providers. Verify the installed localization packages across both apps before choosing the mapping. Audit sign-in, sign-up, recovery, account controls, and validation in both languages.

Clerk documents its localization prop as experimental. Verify behavior in the installed versions and record any vendor-owned gaps. The UI localization prop does not prove that authentication emails are translated. See [Clerk localization](https://clerk.com/docs/guides/customizing-clerk/localization).

### Stripe

Pass the resolved language explicitly when creating Checkout and customer portal sessions. Both Stripe session APIs provide a `locale` parameter. Using the app's `en` or `es` choice avoids the browser overriding a saved preference. See [Checkout session creation](https://docs.stripe.com/api/checkout/sessions/create) and [portal session creation](https://docs.stripe.com/api/customer_portal/sessions/create).

Check whether the installed `@convex-dev/stripe` wrapper exposes this parameter. If it does not, use a narrow server-side adapter or a compatible wrapper update. Preserve existing customer ownership, subscription metadata, and webhook behavior.

Capture the language when a session starts. A later interface language change must not create a second checkout or alter the first session. Success, cancellation, and portal return links stay under `/app` and restore the account's active language. Webhooks remain language-independent.

Translate first-party plan descriptions, interval labels, status labels, invoice controls, and cancellation copy. Use a stable catalog key or product-ID mapping for translated plan copy. Never key translations by a mutable English product name. Do not change price IDs or duplicate billable products merely to translate app labels.

Stripe-hosted interfaces do not automatically translate merchant-authored product descriptions. Document the chosen catalog configuration and verify hosted output in both languages. A proper plan name may stay unchanged. Required descriptive copy must have reviewed translations or an explicit documented vendor limitation.

Audit customer language settings for future Stripe-managed receipts and invoices. Verify actual supported behavior before promising localized documents. Previously issued invoice PDFs remain unchanged. The app's download labels must be translated regardless of the document's original language.

### Welcome email

The existing send action receives a validated language. Resolve it from saved settings or captured signup language, then English. A background job cannot read browser cookies. Store the resolved language with queued work so retries remain consistent.

Translate subject, preview text, greeting fallback, body, button, and HTML language. Use shared brand configuration for the product name. Avoid literal `Turbotemplate` strings that the current lowercase replacement script misses.

Keep this release limited to the existing email flow. Document how future email actions receive language. Audit separately managed Clerk and Stripe messages instead of assuming React Email catalogs control them.

## Architecture and template reuse

Use `next-intl` in both apps. Public routes use optional locale prefixes. App translations use request configuration without localized app URLs. See [next-intl routing](https://next-intl.dev/docs/routing/configuration) and [App Router setup](https://next-intl.dev/docs/getting-started/app-router).

Create a proposed `packages/i18n` package, named `@turbotemplate/i18n`. It owns supported locales, default locale, formatting defaults, translation catalogs, and pure message contracts. Keep React, Next.js, Clerk, and request adapters outside its pure entry point so backend and email code can consume it.

Start with namespaces for common controls, marketing, auth, dashboard, billing, settings, errors, and emails. Load only the required locale and namespaces into client bundles. Keep long-form product content separate when it does not fit message catalogs.

Use one route registry for public links, equivalent-language links, metadata, and sitemap entries. Configure explicit home-only detection and disable automatic library cookie writes that would treat a visited link as a saved preference. Handle the English home alias explicitly.

Next.js 16 uses `proxy.ts` for request interception. Add website language routing there and preserve the existing app Clerk proxy. Verify matcher behavior with `/app` and base-path-stripped requests in the combined deployment. See [Next.js Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

Keep product name, cookie prefix, and production origin in shared configuration. The new project must not depend on absolute paths to Pedalclass, CLIPIN, or the template checkout. This PRD must remain useful when copied into another repository.

`bin/create.sh` must carry the package, catalogs, docs, scripts, and tests into generated projects. Verify renamed workspace imports and package names. Use brand variables in translated messages rather than separate product-name literals in each language.

Document how a downstream developer adds a public page, an app message, a locale, and a localized email. Also document how to keep only English. Removing Spanish must remove its selector entry and sitemap links without breaking catalog checks. Adding a language must not require changes to every component. Changes to the default public language after launch require a separate URL migration plan.

No translation management service is required. A later service must export the same catalog format and pass the same checks.

## Metadata and search

Localize public titles, descriptions, social metadata, and image descriptions. Emit self-referencing canonicals and reciprocal `hreflang` entries for `en` and `es`. Use the English canonical page as `x-default`.

Add a sitemap for the three existing canonical public pages in both languages. Do not list the `/en` alias as another canonical page. Use one configured public origin for all metadata. App routes and unfinished template placeholders stay out of the sitemap. Unknown routes retain a 404 response.

## Translation checks and developer workflow

Add a root `check-i18n` task and connect it to workspace validation and CI. The command name is proposed; it does not currently exist. Translation checks must participate in task caching with catalogs and configuration as inputs.

Checks fail for missing or extra keys, empty required translations, malformed ICU messages, incompatible variables, and invalid rich-text placeholders. Use typed keys to catch invalid references during development. Add a focused scan for new user-facing literals with a reviewed allowlist for units, names, and user data.

An English copy change includes its Spanish change in the same pull request. Review all shipped Spanish content in context. Product owns source copy, a Spanish reviewer owns translation quality, and engineering owns automated checks.

Unexpected runtime failures use the English message and record locale, namespace, and key without user content. This fallback prevents broken workflows. It does not permit missing required Spanish messages at release.

Implementation must add runnable validation scripts and document their actual names. The current README mentions type checks that are not declared at the root. Do not claim an existing command works without checking the package scripts.

## Acceptance tests

| ID | Scenario | Required result |
| --- | --- | --- |
| A1 | First visit to `/` with `es-MX,en;q=0.8` | Non-cacheable 307 to `/es`; query remains; no explicit preference cookie is written. |
| A2 | English preference with Spanish browser | English wins at `/`. |
| A3 | Weighted, regional, uppercase, wildcard, malformed, and `q=0` headers | Matching follows the documented rules; invalid input cannot cause a crash or unsafe redirect. |
| A4 | Open `/pricing`, `/es/pricing`, or `/en` with conflicting preference | URL language wins; no redirect loop. |
| A5 | POST, Server Action, API, webhook, asset, or `/app` request | No public language redirect; existing behavior remains. |
| A6 | Switch website language with a fragment and query | Equivalent page and anchor remain; selection works without JavaScript. |
| A7 | Enter signup from Spanish with no saved preference | Auth starts in Spanish and retains the intended app destination. |
| A8 | Saved Spanish account with English cookie | First usable app view is Spanish; settings remain the authority. |
| A9 | Save language on an existing theme record or a new account | Locale persists; theme remains correct; another user's settings cannot be changed. |
| A10 | Save failure, rapid changes, sign-out, or account switch | Confirmed preference stays consistent; no stale account choice is adopted. |
| A11 | Change language with an edited form or filtered table | Values, filters, sort, pagination, selection, and pending work remain. |
| A12 | Cookies blocked or unrelated preview domains | URL selection works; account preference works; no dependency on cross-domain cookies. |
| A13 | Spanish plural counts and dates; USD, EUR, and JPY values | Formatting matches the chosen locale and currency units; amounts remain unchanged. |
| A14 | Checkout and portal in both languages | Session locale matches the app; return URLs work; no duplicate payment session. |
| A15 | Billing status, plan copy, errors, invoice controls, and cancellation | All first-party copy is translated; product and price IDs remain unchanged. |
| A16 | Render and retry the welcome email in both languages | Subject and body match the captured language and configured product name. |
| A17 | Remove a key or change a message variable | CI fails; unexpected runtime lookup uses the documented English fallback. |
| A18 | Crawl all public routes and inspect mobile accessibility | Canonicals, alternates, sitemap, HTML language, translated labels, and layout are correct. |
| A19 | Generate a fresh project with a different name | i18n package, catalogs, imports, docs, cookie name, branding, and checks work without template-local paths. |
| A20 | Disable Spanish or add a test locale through documented configuration | Selectors, routing, catalogs, and checks follow the configured locale list without component rewrites. |

Automate resolver, route, settings, catalog, vendor-session, and project-creation cases. Test both apps through the same origin to exercise the actual rewrite boundary. Use Stripe test mode for hosted billing verification. Inspect both email renders and complete manual English and Spanish walkthroughs on desktop and mobile web.

## Delivery and release

1. Foundation: inventory copy, add locale configuration, catalogs, formatting, checks, and test fixtures.
2. Website: translate public pages and navigation, add route handling, metadata, and sitemap. Verify app forwarding.
3. App: add settings persistence, auth resolution, translated dashboard and shared controls, and state-preserving language changes.
4. Integrations: complete billing and welcome email language handling. Record and resolve vendor limitations.
5. Template: verify project creation with a new product name and finish downstream developer instructions.
6. Release: complete bilingual review, automated checks, hosted billing checks, and responsive accessibility review.

Partial implementation can merge behind a release control. Do not advertise Spanish support until every scoped first-party workflow passes. Release evidence includes the copy inventory, test report, generated-project check, email previews, and vendor audit.

Rollback restores the last verified bilingual template revision. Preserve existing settings fields and language values. A template release must not automatically change projects previously created from it. Existing downstream projects adopt the change through a documented migration.

Assign a maintainer for locale configuration, a Spanish reviewer, and an owner for vendor configuration before release. Downstream product owners remain responsible for their own legal documents, brand copy, Stripe catalog descriptions, and vendor account settings.
