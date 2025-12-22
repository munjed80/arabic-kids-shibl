# Authentication flow

- Parents create accounts with email + password only; no social login and no child credentials.
- Credentials are verified through NextAuth Credentials provider backed by Prisma + SQLite with bcrypt password hashing.
- Sessions use secure cookies with CSRF protection from NextAuth; JWT strategy keeps the footprint minimal.
- Login attempts are rate-limited in-memory to reduce brute force risk.
- `/account` is protected by middleware and server-side session checks. `/login`, `/register`, and `/logout` handle parent sign-in/out. Lessons remain accessible to children without authentication.
- Registration and login inputs are validated with Zod on both client and server paths. No passwords are logged or shown in UI responses.
