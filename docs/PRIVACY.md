# Privacy and safety

**Principles**
- Child-first: no ads, no trackers, no third-party analytics.
- Minimal data: only parent email and a bcrypt-hashed password are stored for authentication.
- Child data stays local: lesson progress (activity index + completion flag) is saved only in the browser.
- Parent-only accounts: children never create accounts or type credentials.
- No chat or messaging: the companion is visual-only; there is no free text entry.

**Data flow**
- All lesson content is packaged with the app as static JSON.
- Progress is stored in `localStorage` under a single key and can be cleared by the learner at any time.
- Parent email + hashed password are stored in a SQLite database via Prisma for authentication.
- Network calls are limited to login/registration; no child identifiers are collected or transmitted.

**Security posture**
- NextAuth credentials with CSRF protection and secure cookies; bcrypt hashing for parent passwords.
- Basic in-memory rate limiting on login to reduce brute-force attempts.
- Dependencies are kept minimal and vetted via CI.
- Builds avoid external font fetches to reduce external calls.

**Controls for families and educators**
- “Reset lesson” clears progress for the active lesson.
- Companion reactions respect cooldowns to avoid overstimulation.
- Logout endpoint clears the parent session; lessons stay available to children.
- No cookies or tracking pixels beyond authentication cookies.
