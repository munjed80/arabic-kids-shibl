# Contributing Guide

## Branching and PR checklist
- Use feature branches off `main`.
- Keep PRs small and focused; update the PR checklist before requesting review.
- Ensure docs/links stay valid and no generated assets are committed.

## Required checks
- `npm run lint`
- `npm test`
- `npm run build`

## i18n rules
- UI strings must live in `apps/web/src/i18n/{locale}.json`; avoid hardcoded English.
- Supported locales: en, nl, de, sv. Add keys to all dictionaries.
- Language selector uses `arabic-kids-ui-language` in `localStorage`; do not bypass the provider.

## Arabic content rules
- Arabic is allowed only in learning content (lessons, stories, exams, assessments). UI chrome must remain non-Arabic.
- Keep content files in `apps/web/src/content/*` and ensure tests (`languageSeparation.test.ts`) continue to pass.

## Fonts and assets
- Use system fonts only; no remote font fetches. Typography tokens live in `src/app/globals.css`.
- Do not add tracking scripts or analytics.
