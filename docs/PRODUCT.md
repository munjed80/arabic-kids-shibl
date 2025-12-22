# Product brief

**Name:** Arabic Kids – Shibl  
**Audience:** Children ages 8–12 who are beginners in Arabic reading and listening.  
**Goal:** Build confidence with Arabic letters and simple sounds through short, guided interactions.

## MVP scope
- Content-driven lessons defined in JSON (no CMS, no backend).
- Non-verbal lion cub companion reacts only to lesson events (no chat, no text input).
- Parent-only authentication (email + password) for subscription management; children access lessons without accounts.
- Local progress storage in the browser for lesson play; no child data sync.
- Works offline after first load; suitable for Vercel static deployment.

## Pillars
1. **Delight without distraction** – Shibl reacts visually with simple states (idle, intro, thinking, happy, celebrate, sad, cooldown) and respects anti-annoyance cooldowns.
2. **Kid-safe by design** – No tracking, ads, messaging, or personal data collection.
3. **Content-first** – Lessons are JSON + Zod schema validated; UI renders from content, not hardcoded flows.
4. **Tiny, repeatable activities** – 3–5 minute sessions that reinforce recognition and recall.

## Non-goals (MVP)
- No child accounts or social login.
- No generative AI, chat, or voice input.
- No backend services beyond minimal auth database.
- No payment or monetization hooks (subscription UI is placeholder).
