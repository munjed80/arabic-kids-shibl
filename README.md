# arabic-kids-shibl
You are a senior full-stack engineer and technical architect.

Create a production-ready GitHub project named "arabic-kids-shibl" with the following requirements and constraints.

GOAL
Build the foundation for a web platform that teaches Arabic to children (ages 8–12) using short interactive activities.
A non-verbal companion character (a lion cub called "Shibl") reacts visually to the child's actions (success, failure, thinking), with NO chat, NO free text, and NO messaging.

TECH STACK
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Validation: Zod
- Testing: Vitest
- Target deployment: Vercel
- No backend/database in MVP
- No user accounts in MVP
- Progress stored locally (localStorage)

PROJECT STRUCTURE
Create this structure:

arabic-kids-shibl/
├─ apps/
│  └─ web/
│     ├─ src/
│     │  ├─ app/
│     │  ├─ components/
│     │  ├─ features/
│     │  │  ├─ companion/        # Shibl logic (state machine, animations)
│     │  │  ├─ lesson-engine/    # lesson rendering + event bus
│     │  │  └─ progress/         # local progress storage
│     │  ├─ content/
│     │  │  └─ lessons/          # JSON lesson files
│     │  └─ styles/
│     ├─ public/
│     │  ├─ audio/
│     │  └─ images/companion/
│     └─ tests/
├─ docs/
│  ├─ PRODUCT.md
│  ├─ CURRICULUM_YEAR1.md
│  ├─ COMPANION_SPEC.md
│  └─ PRIVACY.md
├─ .github/workflows/ci.yml
├─ README.md
└─ LICENSE

FUNCTIONAL REQUIREMENTS

1) Companion ("Shibl")
- Non-verbal only (animations + small UI effects)
- States: idle, intro, thinking, happy, celebrate, sad, cooldown
- Reacts to lesson events only
- Anti-annoyance rules (no excessive reactions)
- No AI chat, no text input from the child

2) Lesson Engine
- Lessons defined as JSON (content-driven)
- Zod schema validation for lessons
- Emits typed events such as:
  - LESSON_STARTED
  - ANSWER_CORRECT
  - ANSWER_WRONG
  - LEVEL_COMPLETED

3) Progress
- Save lesson progress in localStorage
- Restore progress on reload

4) Privacy
- Child-safe by design
- No tracking, no ads, no personal data
- Include a clear privacy document

WHAT TO GENERATE

- Initialize Next.js app inside apps/web
- Add minimal Tailwind layout
- Create skeleton code for:
  - Event bus
  - Companion state machine
  - Lesson engine
- Create empty placeholder lesson JSON
- Create documentation files with clear professional content
- Add a simple CI workflow (lint + test + build)
- Keep everything minimal, clean, and extensible

IMPORTANT CONSTRAINTS

- Do NOT invent advanced features
- Do NOT add chat, login, AI conversation, or backend
- Do NOT over-engineer
- All code and comments must be in English
- Follow clean architecture and separation of concerns

Proceed step by step and explain briefly what each generated file is responsible for.
