# Companion Reaction Layer Documentation

## Overview

The companion (Shibl) provides consistent, non-verbal visual reactions across all learning contexts: Lessons, Stories, Assessments, and Practice Exams. This document describes the implementation, states, event mapping, and accessibility features.

## Architecture

### Companion Adapter (`src/features/companion/companionAdapter.ts`)

The companion adapter is a unified layer that maps application events to companion state transitions. It works consistently across all contexts:

- **Lessons**: Uses `LessonEventBus` for event-driven reactions
- **Exams**: Reuses `LessonEventBus` (exams are lessons with different scoring)
- **Assessments**: Reuses `LessonEventBus` (assessments are lessons with different reporting)
- **Stories**: Uses custom story events mapped to lesson events

### Usage

```typescript
import { createCompanionAdapter } from "@/features/companion/companionAdapter";

// For lesson-based contexts (lessons, exams, assessments)
const eventBus = new LessonEventBus();
const companion = createCompanionAdapter({ 
  eventBus, 
  onStateChange: (mood) => setCompanionMood(mood) 
});

// Subscribe to events
useEffect(() => {
  const unsubscribe = companion.subscribe();
  return () => unsubscribe();
}, [companion]);

// For stories
const companion = createCompanionAdapter({
  onStateChange: (mood) => setCompanionMood(mood)
});

// Emit story events manually
companion.handleStoryEvent({
  type: "STORY_STARTED",
  payload: { storyId: "story-001" }
});
```

## States

The companion has the following states:

| State | Description | Visual | When Used |
|-------|-------------|--------|-----------|
| `idle` | Neutral, waiting | 🦁 | Default state, no active learning |
| `intro` | Brief greeting | 👋 | Lesson/story starts |
| `thinking` | Processing | 🤔 | Answer submitted, page turns |
| `happy` | Positive feedback | 😺 | Correct answer, lesson complete |
| `celebrate` | Strong positive | 🎉 | Level complete |
| `sad` | Gentle nudge | 😿 | Incorrect answer |
| `cooldown` | Anti-spam calm | 😌 | Too many events too quickly |

### State Accents

Each state has an associated visual accent (color theme):

- `calm`: Sky blue (idle, cooldown)
- `success`: Emerald green (happy, celebrate)
- `warning`: Amber orange (sad)
- `info`: Indigo blue (intro, thinking)

## Event Mapping

### Lesson Events

These events are emitted by the `LessonEventBus` and work across lessons, exams, and assessments:

| Event Type | Companion State | Description |
|------------|-----------------|-------------|
| `LESSON_STARTED` | `intro` | New lesson begins |
| `ANSWER_SUBMITTED` | `thinking` | Learner submits answer |
| `THINKING` | `thinking` | Learner is considering |
| `ANSWER_CORRECT` | `happy` | Correct answer given |
| `ANSWER_WRONG` | `sad` | Incorrect answer given |
| `LESSON_COMPLETED` | `happy` | Lesson finished |
| `LEVEL_COMPLETED` | `celebrate` | Entire level finished |

### Story Events

Story events are custom and mapped to lesson events internally:

| Story Event | Maps To | Companion State |
|-------------|---------|-----------------|
| `STORY_STARTED` | `LESSON_STARTED` | `intro` |
| `STORY_PARAGRAPH_CHANGED` | `THINKING` | `thinking` |
| `STORY_COMPLETED` | `LESSON_COMPLETED` | `happy` |

## Anti-Annoyance Guardrails

### Cooldown Timer

After any reaction event (`ANSWER_CORRECT`, `ANSWER_WRONG`, `LESSON_COMPLETED`, `LEVEL_COMPLETED`), the companion enters a cooldown period (default: 1400ms). During cooldown:

- Additional reaction events trigger the `cooldown` state instead of normal reactions
- Prevents overwhelming visual changes
- Maintains calm, non-distracting experience

### Debouncing

- Only reaction events trigger cooldown
- Non-reaction events (e.g., `THINKING`) bypass cooldown
- Ensures smooth transitions without blocking user flow

### Visual Consistency

- Companion renders in a consistent slot across all pages
- Uses semantic HTML with `role="status"` and `aria-live="polite"`
- No layout shift when state changes
- Fixed positioning prevents content reflow

## Reduced Motion Support

The companion respects `prefers-reduced-motion`:

```css
.companion {
  transition-colors duration-300;
  /* Disable transitions when reduced motion preferred */
}

@media (prefers-reduced-motion: reduce) {
  .companion {
    transition: none;
  }
}
```

Tailwind utility: `motion-reduce:transition-none`

### Implementation

In `CompanionAvatar.tsx`:

```tsx
<div className={`... transition-colors duration-300 motion-reduce:transition-none`}>
  {/* Companion content */}
</div>
```

When reduced motion is enabled:
- No color transitions between states
- Static state swaps only
- Emoji changes instantly
- No animation or motion effects

## Component Placement

### Lessons (HomePageClient)

```tsx
<Container>
  <Card as="header">
    {/* Page header */}
  </Card>
  
  <CompanionAvatar mood={companionMood} />
  
  {/* Lesson content */}
</Container>
```

### Exams (ExamsPageClient)

```tsx
<Container>
  <div className="flex justify-between">
    {/* Page title */}
  </div>
  
  <CompanionAvatar mood={companionMood} />
  
  {/* Exam content */}
</Container>
```

### Assessments (AssessmentsPageClient)

```tsx
<Container>
  <div className="flex justify-between">
    {/* Page title */}
  </div>
  
  <CompanionAvatar mood={companionMood} />
  
  {/* Assessment content */}
</Container>
```

### Stories (StoryReaderClient)

```tsx
<Container>
  <div className="flex justify-between">
    {/* Story title */}
  </div>
  
  <CompanionAvatar mood={companionMood} />
  
  {/* Story paragraphs */}
</Container>
```

## Testing

### Unit Tests

Tests are located in `tests/companionAdapter.test.ts`:

```bash
npm test companionAdapter
```

Test coverage includes:
- Event subscription and mood updates
- Story event mapping
- State transitions
- Cooldown behavior
- Reset functionality
- Story-only mode (no event bus)

### Manual Testing Checklist

1. **Lessons**
   - [ ] Companion shows "intro" when lesson starts
   - [ ] Companion shows "thinking" when answer submitted
   - [ ] Companion shows "happy" on correct answer
   - [ ] Companion shows "sad" on incorrect answer
   - [ ] Companion shows "celebrate" on level complete
   - [ ] Cooldown prevents rapid state changes

2. **Exams**
   - [ ] Companion reacts to exam start
   - [ ] Companion reacts to correct/incorrect answers
   - [ ] Companion reacts to exam completion
   - [ ] Cooldown works during rapid answering

3. **Assessments**
   - [ ] Companion reacts to assessment start
   - [ ] Companion reacts to correct/incorrect answers
   - [ ] Companion reacts to assessment completion
   - [ ] Consistent with exam behavior

4. **Stories**
   - [ ] Companion shows "intro" when story starts
   - [ ] Companion shows "thinking" when turning pages
   - [ ] Companion shows "happy" on story completion
   - [ ] No errors when navigating back/forward

5. **Accessibility**
   - [ ] Reduced motion disables transitions
   - [ ] Screen readers announce state changes
   - [ ] Keyboard navigation not affected
   - [ ] Visual changes don't cause layout shift

## Configuration

### Cooldown Duration

Default: 1400ms (1.4 seconds)

Customize:
```typescript
const companion = createCompanionAdapter({ 
  eventBus,
  cooldownMs: 2000 // 2 seconds
});
```

### State Change Callback

```typescript
const companion = createCompanionAdapter({
  eventBus,
  onStateChange: (mood) => {
    console.log("Companion state:", mood.state);
    setCompanionMood(mood);
  }
});
```

## Privacy & Safety

- **No data collection**: Companion reactions are entirely client-side
- **No analytics**: No events are logged or transmitted
- **Non-verbal only**: No chat, text input, or audio
- **Child-safe**: Calm animations, no aggressive or distracting behavior

## Future Enhancements

Potential improvements (not currently implemented):

1. **Custom animations**: Replace emojis with SVG animations
2. **Sound effects**: Optional subtle audio cues (with mute control)
3. **Personalization**: Remember preferred companion appearance
4. **Multiple companions**: Allow choosing different characters

Note: Any enhancements must maintain:
- Non-verbal nature (no text generation)
- Privacy (no data collection)
- Accessibility (reduced motion support)
- Child-safety (calm, non-distracting)

## Troubleshooting

### Companion not updating

1. Check event bus subscription:
   ```tsx
   useEffect(() => {
     const unsubscribe = companion.subscribe();
     return () => unsubscribe();
   }, [companion]);
   ```

2. Verify `onStateChange` callback:
   ```tsx
   const companion = createCompanionAdapter({
     eventBus,
     onStateChange: (mood) => setCompanionMood(mood) // Must update state
   });
   ```

### Companion stuck in cooldown

- Check cooldown duration (default 1400ms)
- Verify events are spaced appropriately
- Check if multiple rapid events are being emitted

### Story events not working

- Ensure `handleStoryEvent` is called:
   ```tsx
   companion.handleStoryEvent({
     type: "STORY_STARTED",
     payload: { storyId: story.id }
   });
   ```

- Verify companion is created without event bus for stories
- Check useEffect dependencies

## Related Files

- `src/features/companion/companionAdapter.ts` - Adapter implementation
- `src/features/companion/stateMachine.ts` - State machine logic
- `src/components/CompanionAvatar.tsx` - Visual component
- `src/features/lesson-engine/eventBus.ts` - Event bus for lessons
- `tests/companionAdapter.test.ts` - Unit tests
- `tests/companionStateMachine.test.ts` - State machine tests

## References

- [COMPANION_SPEC.md](./COMPANION_SPEC.md) - Original companion specification
- [Reduced Motion Media Query (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [ARIA Live Regions (WAI)](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19)
