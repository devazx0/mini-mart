# mini-mart

pnpm + Turbo monorepo.

- `apps/web` — React + Vite + TypeScript (`:5173`)
- `apps/api` — NestJS + TypeScript (`:3000`)

## Scripts (root)

```sh
pnpm install
pnpm dev       # turbo run dev (api + web)
pnpm build     # turbo run build
pnpm lint      # turbo run lint
pnpm typecheck # turbo run typecheck
```

Web proxies `/api` -> `http://localhost:3000` (see `apps/web/vite.config.ts`).
API enables CORS for `http://localhost:5173` (see `apps/api/src/main.ts`).
