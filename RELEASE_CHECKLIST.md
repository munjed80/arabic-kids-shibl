# Release Checklist

## Install
- `cd apps/web`
- `npm ci`

## Run dev
- `npm run dev`
- Load `/` and switch UI language; ensure login/register screens render without errors.

## Run build
- `npm run build`

## Run test
- `npm test`
- `npm run lint`

## Localization checks (nl/de/sv/en)
- Use the language selector to verify all four locales render without missing keys.
- Confirm Arabic stays in content only (lessons/stories/exams) and not in UI chrome.

## Arabic UI guard test
- Scan navigation, buttons, and helper text to ensure no Arabic UI strings slipped in.
- Confirm Arabic remains right-to-left only inside learning content blocks.

## Final exam sanity check
- Visit `/final-exam`, start the flow, and advance through all sections.
- Confirm completion state saves locally and can be retried without errors.
