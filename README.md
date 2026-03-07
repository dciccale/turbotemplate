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
