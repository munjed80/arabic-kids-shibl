# Authentication flow

- Parents create accounts with email + password only; no social login and no child credentials.
- Credentials are verified through NextAuth Credentials provider with bcrypt password hashing.
- Parent records live in `apps/web/src/data/users.json` for this MVP; writes are append-only and hashed. No database is used in this step.
- `NEXTAUTH_SECRET` must be configured for JWT sessions in all environments (a `dev-secret` fallback is present for local testing only).
- Login attempts are rate-limited in-memory to reduce brute force risk.
- `/account` is protected by NextAuth middleware; `/login`, `/register`, and `/logout` handle parent sign-in/out. Lessons remain accessible to children without authentication.
- Registration and login inputs are validated with Zod on both client and server paths. No passwords are logged or shown in UI responses.
