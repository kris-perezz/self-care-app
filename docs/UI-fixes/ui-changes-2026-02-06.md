# UI Changes and Principles (2026-02-06)

This document summarizes the UI changes and the design-system principles applied in this session.

## Summary of UI Changes
- Added/expanded UI primitives and standardized usage across protected pages.
- Unified icon system to Phosphor and set active states to filled weight.
- Implemented Fluent emoji rendering with curated assets and tokenized emoji constants.
- Replaced placeholder emoji usage with real Fluent emoji values.
- Standardized cards, badges, buttons, and typography to design tokens and utility classes.
- Updated non-clickable cards to remove borders; clickable cards keep borders for affordance.
- Made "View all" and "Shuffle" buttons match in style.
- Reworked emoji picker to match difficulty picker selection affordance.
- Replaced date picker icon overlay with a simpler native date input.
- Replaced time picker implementation with a simpler native mobile-friendly time input.

## Component-Level Changes
- `Card` primitive now applies borders only when `interactive` is true.
- `EmojiPicker` uses radio-style selection with clear selected state and tile styling.
- `FluentEmoji` now maps to real Fluent SVG assets.
- `DatePicker` now uses native input for mobile-friendly picker behavior.
- `TimePicker` now uses native input for mobile-friendly picker behavior.

## Design Principles Applied
- Use design tokens only. No hardcoded colors or generic Tailwind color names.
- Buttons must be solid colors; gradients are not allowed on buttons.
- Regular cards are solid (no gradients). Gradients are reserved for special cards only.
- Typography must use the design system utility classes (heading, body, emphasis, small, tiny).
- Interactive elements must use `interactive-*` classes for hover/active behavior.
- Emojis are for personal/content elements; icons are for system UI and actions.
- Borders on cards are optional. For this phase, borders are reserved for clickable cards only.
- Use consistent spacing and radius values from the design system.

## Notable UX Decisions
- Emoji selection is now visually obvious using the same selection style as the difficulty picker.
- Mobile time and date selection rely on native pickers for consistent OS behavior.

## Files Updated (Highlights)
- `src/components/ui/card.tsx`
- `src/components/ui/emoji-picker.tsx`
- `src/components/ui/fluent-emoji.tsx`
- `src/components/ui/date-picker.tsx`
- `src/components/ui/time-picker.tsx`
- `src/lib/emoji.ts`
- `public/fluent-emoji/*`
- `src/app/(protected)/**/*` (tokenized UI primitives and consistent styling)

## Validation
- `npm run lint`
- `npm run lint:design`
- `npm run build`
