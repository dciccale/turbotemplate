# apps/app

Application zone (Next.js) served under `basePath: "/app"`. See the root `README.md` for monorepo-wide commands and conventions.

## Scripts

```sh
npm run dev      # next dev --turbopack
npm run build    # next build --turbopack
npm start        # next start
npm run lint     # biome check
npm run format   # biome format --write
```

## Dev URL

- App: http://localhost:3001/app

## Shared UI package

Transpiles `@turbotemplate/ui`. Example:

```ts
import { Button } from "@turbotemplate/ui/components/button";
```
