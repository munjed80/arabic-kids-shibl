# Product brief

**Name:** Arabic Kids – Shibl  
**Audience:** Children ages 8–12 who are beginners in Arabic reading and listening.  
**Goal:** Build confidence with Arabic letters and simple sounds through short, guided interactions.

## MVP scope
- Content-driven lessons defined in JSON (no CMS, no backend).
- Non-verbal lion cub companion reacts only to lesson events (no chat, no text input).
- Parent-only authentication (email + password) for subscription management; children access lessons without accounts. Parent records live in a local JSON file for this MVP.
- Local progress storage in the browser for lesson play; no child data sync.
- Works offline after first load; suitable for Vercel static deployment.
- Levels 1 and 2 are playable directly from bundled lesson JSON, with Level 2 unlocking after Level 1 completion.

## Pillars
1. **Delight without distraction** – Shibl reacts visually with simple states (idle, intro, thinking, happy, celebrate, sad, cooldown) and respects anti-annoyance cooldowns.
2. **Kid-safe by design** – No tracking, ads, messaging, or personal data collection.
3. **Content-first** – Lessons are JSON + Zod schema validated; UI renders from content, not hardcoded flows.
4. **Tiny, repeatable activities** – 3–5 minute sessions that reinforce recognition and recall.

## Localization model
- UI is available in English, Dutch, German, and Swedish. The chosen interface language is saved locally and falls back to the browser language when possible.
- Arabic remains the only learning language. Lesson JSON files contain Arabic prompts and hints; no Arabic strings live in UI translation files.
- Language selector is visible to parents and learners, and only affects navigation, instructions, and feedback text—not the Arabic lesson content.

## Non-goals (MVP)
- No child accounts or social login.
- No generative AI, chat, or voice input.
- No backend services beyond minimal auth JSON store for parents.
- No payment or monetization hooks (subscription UI is placeholder).

## Level 1 definition
- **Scope:** Four short lessons in a fixed order — letter recognition, word recognition, first reading confidence, and a review + celebration step.
- **Objective:** Build automatic recognition of core Arabic letters, connect sounds to simple words, and read very short phrases with support.
- **Duration:** Each lesson is ~4–6 minutes and can be replayed; full level completion is possible in a single sitting.
- **Completion rule:** Level 1 is marked complete when all lessons are finished locally; Shibl celebrates and progress remains on the device.
- **Accounts:** No account or payment is required to start, progress through, or finish Level 1.

## Level 2 definition
- **Scope:** Alphabet practice from lessons alphabet-11 through alphabet-30, unlocking only after Level 1 is complete.
- **Objective:** Reinforce recognition and ordering of letters and short words with varied prompts.
- **Duration:** Lessons remain short and repeatable to keep focus and confidence high.
- **Completion rule:** Level 2 marks as complete when each alphabet lesson is finished; progress stays on-device just like Level 1.

## Lesson renderer support
- Interactive steps cover choose, listen, build, and match prompts using the same button-based interaction.
- Review steps render as non-interactive summaries; “good job” messaging comes from existing feedback strings.
- Unknown step types surface a console warning but do not block lesson flow.
