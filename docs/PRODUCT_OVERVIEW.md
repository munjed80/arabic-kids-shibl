# Product Overview

## What this is
- Arabic learning program for kids ages 8–12.
- UI languages: Dutch (nl), German (de), Swedish (sv), and English (en).
- Arabic is reserved for learning content only (lessons, stories, exams), never for navigation UI.

## What’s included
- Lessons 1–20
- Assessments (reading confidence checks)
- Practice Exams
- Final Checkpoint Exam
- Stories (short reading track)

## What’s not included
- No chat or conversational agent
- No backend accounts required
- No tracking or analytics
- No ads

## Privacy model
- Progress and exam summaries are stored locally on the device (localStorage / JSON store for parent auth).
- No remote storage; no network calls for progress.

## Accessibility notes
- RTL handling: Arabic content uses `arabic-content` styles and RTL direction; UI remains LTR.
- `prefers-reduced-motion` friendly animations (lightweight companion reactions).
- Typography tokens are defined in `src/app/globals.css` (`--font-ui`, `--font-arabic-content`, sizing/line-height).
