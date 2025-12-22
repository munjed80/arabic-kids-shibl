# Privacy and safety

**Principles**
- Child-first: no ads, no trackers, no third-party analytics.
- Minimal data: only parent email + bcrypt password hash are stored for authentication; no child data is collected.
- No chat or messaging: the companion is visual-only; there is no free text entry.

**Data flow**
- All lesson content is packaged with the app as static JSON.
- Progress is stored in `localStorage` under a single key and can be cleared by the learner at any time.
- Parent accounts are stored in `apps/web/src/data/users.json` with hashed passwords. This file is local to the deployment and intended for MVP testing.
- No child identifiers are created; lesson play remains available without login.

**Security posture**
- A minimal backend route handles parent auth with CSRF protection and rate-limited login attempts.
- Dependencies are kept minimal and vetted via CI.
- Builds avoid external font fetches to reduce external calls.

**Controls for families and educators**
- “Reset lesson” clears progress for the active lesson.
- Companion reactions respect cooldowns to avoid overstimulation.
- Parent dashboard access requires login; logout clears the session cookie.
- No tracking pixels are used; auth cookies are limited to session management.
