# turbotemplate

some notes:
https://www.arhamhumayun.com/blog/streamed-ai-response

This repository is a Turborepo-managed monorepo with two Next.js apps and a shared UI package. ESLint has been replaced by Biome for linting and formatting in apps.

## What's inside

### Apps

- `apps/web`: Public site (Next.js). Rewrites `/app` routes to the application zone via `APP_ORIGIN`.
- `apps/app`: Application zone (Next.js) served under the base path `/app`.

### Packages

- `packages/ui` (`@turbotemplate/ui`): Shared component library and utilities used by both apps.

All code is TypeScript.

## Product requirements

- [English and Spanish internationalization PRD](docs/i18n-prd.md): website routing, app preferences, authentication, billing, emails, and support in generated projects.

## Requirements

- Node.js ≥ 18
- Bun (repo is configured with `packageManager: bun@1.3.9`)

## Install

```sh
bun install
```

## Develop

Run both apps with Turborepo:

```sh
bun run dev
```

To run a single app:

```sh
bunx turbo run dev --filter=web
bunx turbo run dev --filter=app
```

Local defaults (when both are running):

- Web: http://localhost:3000
- App: http://localhost:3001/app

The `web` app rewrites `/app` traffic to the app origin. Set `APP_ORIGIN` so links resolve correctly:

```sh
# from apps/web
APP_ORIGIN=http://localhost:3001
```

## Build

Build everything:

```sh
bun run build
```

Build a single target:

```sh
bunx turbo run build --filter=web
bunx turbo run build --filter=app
```

## Linting and formatting (Biome)

We use Biome instead of ESLint/Prettier inside apps.

From the repo root (runs across workspaces via Turborepo):

```sh
bun run lint            # executes "biome check" in each app
bun run format          # executes "biome format --write" in each app
```

From an individual app directory:

```sh
bun run lint
bun run format
```

Note: The root still includes Prettier primarily for miscellaneous files. Prefer Biome for TypeScript/JavaScript formatting in app workspaces.

## Type checking

```sh
bun run check-types
```

## Using the shared UI package

Both apps transpile and consume `@turbotemplate/ui`.

Example usage:

```ts
import { Button } from "@turbotemplate/ui/components/button";

export default function Example() {
  return <Button>Click me</Button>;
}
```

Aliases provided by the apps map `ui` and `utils` to the package (see each app's `components.json`).

## Multi‑zone routing

- `apps/app` has `basePath: "/app"`.
- `apps/web` rewrites `/app` and `/app/:path*` to `APP_ORIGIN`.

For local development set `APP_ORIGIN=http://localhost:3001` in `apps/web` when both apps run.

## Turborepo basics

- Cache-aware tasks live in `turbo.json`.
- Use `--filter` to scope tasks, e.g. `--filter=web` or `--filter=app`.

Useful docs: tasks, caching, filters, and configuration at the Turborepo site.

## Transactional email

Set email variables in the Convex deployment. The [backend environment example](packages/backend/.env.example) lists the settings for each provider.

Plunk is the default. Set `PLUNK_FROM_EMAIL` to a verified email address without a display name. Test mode records messages in Convex without sending them. To send live mail, set `PLUNK_API_KEY` and set `PLUNK_TEST_MODE=false`. For delivery events, set `PLUNK_WEBHOOK_SECRET` and configure Plunk workflows to post to `/plunk-webhook` with that secret as a bearer token.

To use Resend, set `EMAIL_DELIVERY_PROVIDER=resend`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL`. Resend test mode accepts only Resend test recipients. Set `RESEND_TEST_MODE=false` to send to real recipients. Resend sends through its API and reports delivery status in its dashboard.

Before upgrading a deployment that uses the old Resend component, drain its email queue. The new deployment uses `/plunk-webhook` in place of `/resend-webhook`. Remove the old Resend webhook after pending events have arrived.

When a caller can retry the welcome email action, pass the same `idempotencyKey` for the same event. Resolve uncertain sends before switching providers for a retry.

## English and Spanish

Both apps share typed catalogs in `packages/i18n`. Public Spanish pages use `/es`. Account pages keep `/app` paths and save the selected language in account settings.

See [the translation guide](docs/i18n-guide.md) for message, route, locale, email, and template changes. See [vendor release checks](docs/i18n-vendors.md) before announcing bilingual support.

```sh
bun run check-i18n
bun run test
bun run check-template
```

Dependencies use the latest stable registry versions checked on 4 November 2026. Use Bun 1.4.0 and Node 24 LTS. Next.js 16.4.5 has a small tracked patch to preserve response `Vary` headers. See the translation guide before upgrading Next.js.
