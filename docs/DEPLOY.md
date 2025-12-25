# Deploying arabic-kids-shibl (apps/web)

Next.js App Router app with client-side progress storage (no external APIs). Uses system fonts only—no remote font downloads.

## Prerequisites

```bash
cd apps/web
npm ci
cp .env.example .env.local  # and set real secrets
```

Required runtime env:
- `NEXTAUTH_SECRET` (strong, production-only)
- `DATABASE_URL` (SQLite/Prisma connection, defaults to `file:./prisma/dev.db`)
- `USER_STORE_PATH` (optional JSON store path for parent accounts)

Local production preview:

```bash
npm run build
npm run start
```

## Primary: Vercel
- Framework preset: **Next.js**
- Root directory: `apps/web`
- Install command: `npm ci`
- Build command: `npm run build`
- Output: `.next`
- Development: `npm run dev`

CLI deploy:

```bash
cd apps/web
vercel login
vercel link         # select the project, set root to apps/web
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
vercel env add USER_STORE_PATH
vercel --prod --yes # builds and deploys
```

Routing: Vercel automatically handles App Router routes and the `/api` handlers. Middleware (proxy) is supported out of the box; no extra rewrites needed.

## Alternative: Netlify
- Build image: latest Node LTS
- Build command: `npm run build`
- Publish directory: `.next`
- Install command: `npm ci`

CLI deploy:

```bash
cd apps/web
netlify init --manual    # once per project
netlify env:set NEXTAUTH_SECRET <value>
netlify env:set DATABASE_URL <value>
netlify env:set USER_STORE_PATH <value>
netlify deploy --build --prod --dir=.next
```

Netlify’s Next.js Runtime handles App Router routing and dynamic functions automatically. No `_redirects` file is required; all paths should route to Next’s handler.

## GitHub Pages note

GitHub Pages is static-only. This app relies on NextAuth and middleware, so a Pages deploy would require removing auth/middleware and exporting a static build—**not recommended for production**.

## i18n notes
- Client-side i18n with locales `en`, `nl`, `de`, `sv`. No Next.js locale subpaths are used.
- The language selector writes `arabic-kids-ui-language` to `localStorage`. Avoid aggressive HTML caching that could pin a single locale for all users.

## Routing notes
- App Router uses file-based routes; keep wildcard routing enabled so unknown paths fall through to Next.js.
- Middleware protects `/account`; ensure host allows the middleware/proxy to run.

## Assets & fonts
- All fonts are system defaults (see `src/app/globals.css`). There are **no remote font fetches**; nothing extra to configure for CSP.
