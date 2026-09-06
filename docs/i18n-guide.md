# Change translated content

The source catalogs are in `packages/i18n/src/messages`. English defines the keys. Update English and Spanish in the same change. Use complete ICU messages with named variables. Pass user content as variables. Keep user names and document titles unchanged.

Run `bun run check-i18n`, `bun run check-types`, and `bun run test` before review. The catalog check rejects missing keys, extra keys, blank messages, invalid ICU, and incompatible variables or tags. Both apps also scan JSX text and accessible labels. Their `i18n-allowlist.json` files contain reviewed exceptions for person names and initials. Do not allowlist untranslated interface copy.

## Add an app message

1. Add the message to the appropriate namespace in both catalogs.
2. Call `useTranslations("namespace")` in a client component.
3. Use `getTranslations("namespace")` in a server component.
4. Use `useFormatter()` for dates and numbers. Use `formatMoney` for Stripe amounts.
5. Use `DecimalInput` for the existing editable numeric fields.

The app updates its translation provider without replacing the application tree. Keep table column components stable. Do not use locale as a React key. Store stable error codes in state and translate them during rendering.

## Add a public page

1. Add the unprefixed path to `publicRoutes` in `packages/i18n/src/index.ts`.
2. Add the route under `apps/web/app/[locale]`.
3. Add its path to the web proxy matcher. Next.js requires static matcher values.
4. Add translated title and description messages.
5. Extend `pageMetadata` for the new page.
6. Use `publicPath` for links. Use its navigation option for the English home alias.

The sitemap reads the route registry. `/en` is a navigation alias. Its canonical URL is `/`. Only requests to `/` negotiate language. Other public paths choose language from the URL.

Set `NEXT_PUBLIC_MARKETING_URL` to the public origin in both apps. Set the web app's `APP_ORIGIN` to the app server origin for forwarding. Set the backend's `APP_ORIGIN` to the public origin for billing return URLs. These values can differ in local development.

## Add a locale

1. Add the locale, language name, and formatting locale in `packages/i18n/src/index.ts`.
2. Add a complete catalog and register its loader in `src/messages.ts` and email catalog in `src/email.ts`.
3. Add the Clerk mapping in `src/clerk.ts`.
4. Extend `packages/backend/convex/validators.ts` after you verify vendor support.
5. Add the public prefix to the static web proxy matcher.
6. Extend the resolver and route tests.

Selectors and sitemap entries read `locales`. Components do not need individual locale branches. Vendor adapters and validators remain explicit. Check Stripe's supported languages before passing a new value to its APIs.

To keep only English, remove Spanish from `locales`, remove its catalog loader and selector configuration, and remove its proxy matcher entries. Remove Spanish-specific test cases. Keep `en` as the public default. Preserve stored language values during a migration until existing accounts have a documented fallback. Changing the default public language requires a separate URL migration.

## Add an email

Pass a validated locale into queued work. Resolve saved account language first, then captured signup language, then English. Background work cannot read browser cookies. Capture language before scheduling so retries render the same content.

The existing `sendWelcomeEmail` internal action now requires `locale`. Update any downstream callers when adopting this revision. Use the pure email formatter and shared `product.name`. Do not embed the template brand in message text. Set `appUrl` to a local app entry URL on your configured public origin.

## Generate a project

Run `bash bin/create.sh my-project` from a directory outside this checkout. The generator copies the i18n package, catalogs, validation commands, tests, CI, and this guide. It replaces the template name in workspace imports, brand configuration, cookie names, and the lockfile. It excludes credentials, local Clerk state, caches, and build output.

Run `bun run check-template` to create a temporary renamed project and execute its checks. The command prints the temporary project path for inspection.

## Verify production routing

Build and start both apps with the web `APP_ORIGIN` pointing to the app server. Run `I18N_TEST_ORIGIN=http://localhost:3000 bun run --filter web check-http`. This checks real response status, language, redirects, HTML language, and cache headers. Unit tests alone cannot detect response headers that the framework overwrites.

Next.js 16.3.4 overwrites an existing `Vary` header in its app-page runtime template. The tracked patch in `patches/next@16.3.4.patch` preserves that header and appends the framework fields. Bun applies it during installation. Keep the patch until an upstream version passes the HTTP check without it. Run the HTTP check after each Next.js upgrade.

The app's initial HTTP language describes its loading screen. After authentication, the locale provider waits for settings owned by the current user and applies the saved language. An account-mirror cookie cannot show another account's language while settings load.
