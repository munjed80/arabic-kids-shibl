# arabic-kids-shibl

Foundation for a child-safe Arabic learning experience with a non-verbal lion cub companion, **Shibl**. The MVP is entirely client-side (Next.js App Router), uses Tailwind CSS for styling, Zod for lesson validation, Vitest for testing, and stores progress locally.

## Quick Start

```bash
cd apps/web
npm ci
npm run dev           # start local dev server
npm run lint          # ESLint
npm run test          # Vitest
npm run build         # Next.js build
```

## What’s included

- **Companion**: Non-verbal state machine with anti-annoyance cooldowns; reacts only to lesson events.
- **Lesson engine**: Zod-validated, content-driven lessons defined in JSON with a typed event bus.
- **Progress**: LocalStorage-only persistence; no accounts, no network storage.
- **Privacy**: No chat, no messaging, no ads, no tracking. See `docs/PRIVACY.md`.
- **CI**: GitHub Actions workflow running lint, test, and build for `apps/web`.

## Project structure

```
arabic-kids-shibl/
├─ apps/web/                # Next.js app
│  ├─ src/app/              # App Router pages
│  ├─ src/components/       # UI components
│  ├─ src/features/         # Core logic (companion, lesson engine, progress)
│  ├─ src/content/lessons/  # JSON lesson files
│  ├─ src/styles/           # Shared style notes
│  └─ tests/                # Vitest specs
├─ docs/                    # Product, curriculum, privacy docs
├─ .github/workflows/ci.yml # CI pipeline (lint/test/build)
└─ LICENSE                  # MIT license
```

## File responsibilities (high level)

- `apps/web/src/app/page.tsx` – Landing experience, wires lesson engine, companion, and progress UI.
- `apps/web/src/app/layout.tsx` – Global metadata and layout shell.
- `apps/web/src/components/*` – Presentational pieces (companion badge, activity card, progress).
- `apps/web/src/features/lesson-engine/*` – Lesson schema (Zod), typed event bus, and engine logic.
- `apps/web/src/features/companion/stateMachine.ts` – Shibl state machine with anti-annoyance cooldowns.
- `apps/web/src/features/progress/localProgress.ts` – LocalStorage persistence helpers.
- `apps/web/src/content/lessons/lesson-letters.json` – Placeholder content-driven lesson.
- `apps/web/tests/*` – Vitest coverage for bus, engine, companion, and progress helpers.
- `docs/*.md` – Product, curriculum, companion spec, and privacy stance.
- `.github/workflows/ci.yml` – CI to lint, test, and build the web app.

## Safety & privacy

- No backend, no accounts, no chat, and no free text inputs.
- All progress is stored locally in the browser via LocalStorage.
- No tracking, analytics, or ads included.
- See `docs/PRIVACY.md` for the full statement.
- Developer note: Arabic is reserved exclusively for learning content (lessons, stories, exams). UI text must never contain Arabic.

## Deploy

- Primary: Vercel (Next.js preset). See `docs/DEPLOY.md` for commands and env setup.
- Alternative: Netlify (Next.js runtime). Same build steps as above.

## Documentation

- Product overview: `docs/PRODUCT_OVERVIEW.md`
- Architecture: `docs/ARCHITECTURE.md`
- Deploy guide: `docs/DEPLOY.md`
- Support: `docs/SUPPORT.md`
- Release checklist: `RELEASE_CHECKLIST.md`
- Privacy: `docs/PRIVACY.md`
- Curriculum and content: `docs/LEVEL*.md`, `docs/EXAMS.md`, `docs/ASSESSMENTS.md`, `docs/STORIES.md`, `docs/COMPANION*.md`

## Roadmap (non-binding)
- Content quality pass
- Richer story track
- Optional accounts
