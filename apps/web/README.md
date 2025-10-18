# apps/web

Public site (Next.js). See the root `README.md` for monorepo-wide commands and conventions.

## Scripts

```sh
npm run dev      # next dev --turbopack
npm run build    # next build --turbopack
npm start        # next start
npm run lint     # biome check
npm run format   # biome format --write
```

## Dev URLs

- Web: http://localhost:3000

## Multi‑zone rewrites

This app forwards `/app` routes to the application zone using `APP_ORIGIN`.

```sh
# in apps/web/.env.local
APP_ORIGIN=http://localhost:3001
```

Routes:

- `/app` → `${APP_ORIGIN}/app`
- `/app/:path*` → `${APP_ORIGIN}/app/:path*`

## Shared UI package

Transpiles `@turbotemplate/ui`. Example:

```ts
import { Button } from "@turbotemplate/ui/components/button";
```
