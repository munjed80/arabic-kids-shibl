# Typography Guidelines for Arabic Learning Content

## Overview

This document describes the typography strategy implemented for Arabic learning content in the application. The goal is to enhance readability for children aged 8-12 while keeping UI chrome (buttons, navigation, cards) in the locale-specific Latin fonts.

## Font Strategy

### System Font Stack
We use a system font stack prioritizing locally available Arabic fonts to ensure:
- No remote font dependencies
- Optimal performance (no network requests)
- Native OS rendering
- Consistent appearance across platforms

**Arabic Content Font Stack:**
```css
--font-arabic-content: "Geeza Pro", "Traditional Arabic", "Simplified Arabic", "Arial", sans-serif;
```

**Font Coverage by Platform:**
- **macOS/iOS**: Geeza Pro (excellent Arabic readability)
- **Windows**: Traditional Arabic or Simplified Arabic
- **Linux/Android**: Arial (has Arabic support)

### UI Font Stack
UI elements (buttons, navigation, cards, labels) use the existing locale-based fonts:
```css
--font-ui: system-ui, -apple-system, "Segoe UI", sans-serif;
```

## CSS Custom Properties (Tokens)

The following CSS custom properties are defined in `src/app/globals.css`:

| Token | Value | Purpose |
|-------|-------|---------|
| `--font-ui` | `system-ui, -apple-system, "Segoe UI", sans-serif` | UI chrome fonts |
| `--font-arabic-content` | `"Geeza Pro", "Traditional Arabic", "Simplified Arabic", "Arial", sans-serif` | Arabic learning content |
| `--arabic-font-size` | `1.5rem` (24px) | Base size for Arabic text |
| `--arabic-line-height` | `2` | Generous line height for readability |
| `--arabic-paragraph-gap` | `1rem` (16px) | Spacing between paragraphs |

## Typography Classes

### `.arabic-content`
Applied to Arabic learning content elements (lessons, stories, exams).

**Properties:**
- Font family: Arabic-optimized system fonts
- Font size: 1.5rem (24px base)
- Line height: 2 (200%)
- Direction: RTL (right-to-left)
- Text align: right

**Usage:**
```tsx
<p className="arabic-content" lang="ar">
  {arabicText}
</p>
```

### `.arabic-content.inline`
For inline Arabic text within UI elements.

**Properties:**
- Inherits direction and alignment from parent
- Maintains Arabic font family and sizing

**Usage:**
```tsx
<p>
  Hint: <span className="arabic-content inline" lang="ar">{arabicHint}</span>
</p>
```

## Target Typography Sizes

### Mobile (< 640px)
- **Arabic content**: 1.5rem (24px)
- **Line height**: 2 (200%)
- **Paragraph gap**: 1rem (16px)

### Desktop (≥ 640px)
- **Arabic content**: 1.5rem (24px)
- **Line height**: 2 (200%)
- **Paragraph gap**: 1rem (16px)

*Note: Current implementation uses the same sizing across breakpoints. Responsive adjustments can be added via media queries if needed.*

## Good Readability Criteria for Kids 8-12

### Font Size
- **Minimum**: 1.5rem (24px)
- Larger text reduces eye strain and improves focus
- Suitable for developing readers

### Line Height
- **Target**: 2 (200% or 48px for 24px text)
- Generous spacing prevents lines from visually merging
- Helps track reading position

### Letter Spacing
- Uses default letter spacing from system fonts
- Arabic fonts have built-in optimal spacing

### Contrast
- **Text color**: `#0f172a` (slate-900)
- **Background**: `#f8fafc` (slate-50) or white
- Contrast ratio: > 12:1 (exceeds WCAG AAA)

### Direction & Alignment
- **Direction**: RTL for all Arabic content
- **Alignment**: Right-aligned
- Proper BiDi (bidirectional) handling with `lang="ar"` attribute

## Content Areas with Arabic Typography

### 1. Lessons (LessonActivityCard)
- **Prompt**: Activity question/instruction
- **Hint**: Optional guidance text
- **Choices**: Answer options

**Components:**
- `src/components/LessonActivityCard.tsx`

### 2. Stories (StoryReaderClient)
- **Paragraphs**: Story content
- **Sentences**: Individual story sentences

**Components:**
- `src/app/stories/[id]/StoryReaderClient.tsx`

### 3. Exams (ExamsPageClient)
- **Questions**: Exam prompts
- **Choices**: Answer options

**Components:**
- `src/app/exams/ExamsPageClient.tsx` (uses LessonActivityCard)

### 4. Assessments (AssessmentsPageClient)
- **Questions**: Assessment prompts
- **Choices**: Answer options

**Components:**
- `src/app/assessments/AssessmentsPageClient.tsx` (uses LessonActivityCard)

## RTL Handling

### Arabic Content Blocks
- Automatically rendered RTL via `direction: rtl`
- Text alignment: right
- Applied via `.arabic-content` class
- `lang="ar"` attribute for proper accessibility

### UI Chrome
- Remains LTR for all locales (nl/de/sv/en)
- Buttons, navigation, cards use UI fonts
- No RTL applied to non-content areas

## Testing Recommendations

### Visual Regression Checklist
1. **Font rendering**: Verify Arabic fonts load correctly
2. **Sizing**: Check 24px base size on mobile and desktop
3. **Line height**: Confirm generous spacing (2x)
4. **Alignment**: Validate RTL and right-alignment
5. **Contrast**: Test readability in different lighting
6. **Mixed content**: Verify inline Arabic in UI labels

### Browser Testing
- Chrome/Edge (Windows, macOS, Linux)
- Safari (macOS, iOS)
- Firefox (all platforms)

### Platform Testing
- macOS: Should use Geeza Pro
- Windows: Should use Traditional/Simplified Arabic
- Linux: Should fall back to Arial

## Future Enhancements

### Optional Font Bundle
If system fonts prove inadequate:
1. Add Noto Naskh Arabic (WOFF2) to `public/fonts/`
2. Add `@font-face` declaration in `globals.css`
3. Update `--font-arabic-content` stack

Example:
```css
@font-face {
  font-family: "Noto Naskh Arabic";
  src: url("/fonts/noto-naskh-arabic-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### Responsive Typography
Add breakpoint-specific sizing if needed:
```css
@media (min-width: 768px) {
  :root {
    --arabic-font-size: 1.75rem;
  }
}
```

## Accessibility

- `lang="ar"` attribute on all Arabic content
- Proper semantic HTML (h1-h6, p, etc.)
- High contrast ratios (>12:1)
- Screen reader friendly with RTL support

## Performance

- **Zero network requests**: All fonts are system-installed
- **No FOUT/FOIT**: Fonts available immediately
- **No layout shift**: System fonts render instantly

## Maintenance

### Updating Font Stack
Edit `src/app/globals.css` and modify:
```css
--font-arabic-content: "Geeza Pro", "Traditional Arabic", "Simplified Arabic", "Arial", sans-serif;
```

### Updating Sizing
Adjust tokens in `src/app/globals.css`:
```css
--arabic-font-size: 1.5rem;
--arabic-line-height: 2;
--arabic-paragraph-gap: 1rem;
```

### Adding New Content Areas
1. Add `className="arabic-content"` to Arabic text elements
2. Add `lang="ar"` attribute
3. Ensure parent doesn't override RTL/alignment

## References

- [Arabic Typography Best Practices](https://arabictype.net/)
- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [MDN: CSS dir attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir)
