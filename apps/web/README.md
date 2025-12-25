# Web app – Arabic Kids (Shibl)

Next.js App Router project for the child-safe Arabic learning MVP. Styling is Tailwind CSS, lessons are content-driven JSON validated with Zod, and progress is stored locally only. No chat, no accounts, no remote font loading.

## Run locally

```bash
cd apps/web
npm install
npm run dev   # start dev server
npm run lint  # ESLint
npm run test  # Vitest
npm run build # Production build
```

## Key pieces
- `src/app/page.tsx` – Landing page that starts a lesson, wires the companion, and shows progress.
- `src/components/ui/*` – Reusable UI primitives (Button, Card, Container).
- `src/features/lesson-engine/*` – Lesson schema, event bus, and engine.
- `src/features/companion/stateMachine.ts` – Non-verbal companion logic with cooldowns.
- `src/features/progress/localProgress.ts` – LocalStorage helpers for progress.
- `src/content/lessons/level1-sound-*.json` – Phase A lessons for the first three Arabic letter sounds.
