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

## Requirements

- Node.js ≥ 18
- NPM (repo is configured with `packageManager: npm@11.5.1`)

## Install

```sh
npm install
```

## Develop

Run both apps with Turborepo:

```sh
npm run dev
```

To run a single app:

```sh
npx turbo run dev --filter=web
npx turbo run dev --filter=app
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
npm run build
```

Build a single target:

```sh
npx turbo run build --filter=web
npx turbo run build --filter=app
```

## Linting and formatting (Biome)

We use Biome instead of ESLint/Prettier inside apps.

From the repo root (runs across workspaces via Turborepo):

```sh
npm run lint            # executes "biome check" in each app
npx turbo run format    # executes "biome format --write" in each app
```

From an individual app directory:

```sh
npm run lint
npm run format
```

Note: The root still includes Prettier primarily for miscellaneous files. Prefer Biome for TypeScript/JavaScript formatting in app workspaces.

## Type checking

```sh
npm run check-types
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
