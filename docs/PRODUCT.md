# Product brief

**Name:** Arabic Kids – Shibl  
**Audience:** Children ages 8–12 who are beginners in Arabic reading and listening.  
**Goal:** Build confidence with Arabic letters and simple sounds through short, guided interactions.

## MVP scope
- Content-driven lessons defined in JSON (no CMS, no backend).
- Non-verbal lion cub companion reacts only to lesson events (no chat, no text input).
- Local progress storage in the browser for children; no child accounts or usernames.
- Parent-only email/password authentication to manage the €7/month subscription and view progress.
- SQLite via Prisma stores parent records and placeholder subscriptions with hashed passwords.
- Works offline after first load; suitable for Vercel static deployment.

## Pillars
1. **Delight without distraction** – Shibl reacts visually with simple states (idle, intro, thinking, happy, celebrate, sad, cooldown) and respects anti-annoyance cooldowns.
2. **Kid-safe by design** – No tracking, ads, messaging, or personal data collection.
3. **Content-first** – Lessons are JSON + Zod schema validated; UI renders from content, not hardcoded flows.
4. **Tiny, repeatable activities** – 3–5 minute sessions that reinforce recognition and recall.

## Non-goals (MVP)
- No social login or child logins.
- No generative AI, chat, or voice input.
- No analytics; subscription billing remains a placeholder.
