# Privacy and safety

**Principles**
- Child-first: no ads, no trackers, no third-party analytics.
- Minimal data: only lesson progress (activity index + completion flag) is stored locally in the browser.
- No accounts: no email, passwords, or identifiers.
- No chat or messaging: the companion is visual-only; there is no free text entry.

**Data flow**
- All lesson content is packaged with the app as static JSON.
- Progress is stored in `localStorage` under a single key and can be cleared by the learner at any time.
- No data leaves the device; there are no network calls for user data.

**Security posture**
- Runs on the client via Vercel; no backend surface in the MVP.
- Dependencies are kept minimal and vetted via CI.
- Builds avoid external font fetches to reduce external calls.

**Controls for families and educators**
- “Reset lesson” clears progress for the active lesson.
- Companion reactions respect cooldowns to avoid overstimulation.
- No cookies or tracking pixels are used.
