# Parent authentication

**Goal:** Parent-only access for subscription management while children continue lessons without entering credentials.

## Stack
- NextAuth (Credentials provider, JWT sessions, secure cookies, CSRF on forms).
- Prisma + SQLite (`prisma/schema.prisma`) with `User` and `Subscription` tables.
- Passwords hashed with bcryptjs (bcrypt algorithm, 10 rounds).
- Basic in-memory rate limiting (5 attempts per 15 minutes, keyed by IP/email).

## Flows
- **Register (`/register`, POST `/api/register`)**: Validate with Zod, ensure unique email, hash password, create user row. Auto-signs in and redirects to `/account`.
- **Login (`/login`)**: Zod-validated credentials passed to NextAuth Credentials provider; on success sets secure session cookie and JWT.
- **Logout (`/logout`)**: Calls NextAuth `signOut`, returning to `/`.

## Protection
- Middleware guards `/account`; unauthenticated users are redirected to `/login`.
- Server-side check in `src/app/account/page.tsx` ensures sessions before rendering.
- Children can keep using lessons at `/` regardless of parent session.

## Environment
- Database defaults to `file:./prisma/dev.db`; override with `DATABASE_URL` if needed.
- Set `NEXTAUTH_SECRET` in production to secure JWT/session cookies.
