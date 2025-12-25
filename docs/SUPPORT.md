# Support Guide

## Common issues
- **Build fails**: Run `npm ci` from `apps/web` to ensure deps match lockfile. Verify Node LTS.
- **Missing env vars**: Copy `.env.example` to `.env.local` and set `NEXTAUTH_SECRET`, `DATABASE_URL`, `USER_STORE_PATH` if overriding.
- **Locale not switching**: Clear `localStorage` key `arabic-kids-ui-language` or switch via the language selector; ensure browser allows localStorage.

## Resetting progress
- Progress and assessments are stored locally. Clear site data/localStorage for the domain to reset.
- Parent auth JSON store (if using filesystem store) can be removed at `USER_STORE_PATH` (defaults to `src/data/users.json`) in development.

## Final exam verification
- Run `npm run dev`, visit `/final-exam`.
- Start the flow, advance through all sections, and ensure completion state is reached.
- Confirm you can retry after completion without errors.
