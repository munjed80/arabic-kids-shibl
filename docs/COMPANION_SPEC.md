# Companion specification – Shibl (lion cub)

**Role:** Visual guide and motivator. Non-verbal only—no chat bubbles, no text input, no audio voiceover.  
**Trigger source:** Lesson events emitted by the lesson engine; never user text.

## States
- **idle** – Neutral; waiting for the next action.
- **intro** – Brief greeting when a lesson starts.
- **thinking** – While the learner is selecting or while an answer is being checked.
- **happy** – Positive feedback for correct answers.
- **celebrate** – Strong positive feedback when a level/lesson completes.
- **sad** – Gentle nudge on incorrect answers.
- **cooldown** – Temporary calm state to avoid over-stimulation when events fire too frequently.

## Anti-annoyance
- Cooldown timer after reaction events (correct/wrong/complete) before another strong reaction can play.
- Reactions only triggered by lesson events; no idle animations on a loop.
- Visible but unobtrusive placement (badge-style component).

## Inputs and outputs
- **Inputs:** Typed lesson events (LESSON_STARTED, ANSWER_SUBMITTED, ANSWER_CORRECT, ANSWER_WRONG, LESSON_COMPLETED, LEVEL_COMPLETED, THINKING).
- **Outputs:** Visual state only (emoji/animation hooks). No messages, no chat, no sound.
- **Data:** No PII stored or transmitted. No analytics hooks.

## Extensibility
- State machine is isolated in `apps/web/src/features/companion/stateMachine.ts`.
- UI rendering is decoupled (`apps/web/src/components/CompanionAvatar.tsx`) so animation/illustration swaps do not affect logic.
- Event bus subscription keeps the companion reactive without coupling to lesson rendering.
