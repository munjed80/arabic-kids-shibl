# Architecture

## Content separation
- UI text is localized (en/nl/de/sv) via JSON dictionaries in `apps/web/src/i18n/*`.
- Arabic is used only in learning content (lessons, assessments, exams, stories) and never in UI chrome.
- UI vs. content separation is enforced in tests (`languageSeparation.test.ts`).

## Content locations
- Lessons: `apps/web/src/content/lessons`
- Stories: `apps/web/src/content/stories`
- Exams (practice and final checkpoint): `apps/web/src/content/exams`
- Assessments: `apps/web/src/content/assessments`

## i18n architecture
- Client-side provider: `apps/web/src/i18n/I18nProvider.tsx`
- Config and locale resolution: `apps/web/src/i18n/config.ts`
- Dictionaries: `apps/web/src/i18n/{en,nl,de,sv}.json`
- Storage key: `arabic-kids-ui-language` in `localStorage`
- Default locale: `en`

## Guardrails
- Arabic UI scan: tests ensure UI strings are non-Arabic while content can include Arabic.
- No hardcoded English: UI strings must live in locale dictionaries; avoid embedding English literals in components.
- Error boundary uses localized strings and console-only logging (`apps/web/src/app/error.tsx`).

## Testing overview
- Unit/integration tests via Vitest: `npm test`
- ESLint for linting: `npm run lint`
- Build validation: `npm run build`
- Localization coverage tests: `apps/web/tests/i18n.test.ts`
- Content separation test: `apps/web/tests/languageSeparation.test.ts`
