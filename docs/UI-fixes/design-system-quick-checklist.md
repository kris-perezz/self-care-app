# Design System Quick Reference Checklist

Use this checklist when creating or reviewing components to ensure design system compliance.

---

## ✅ Button Checklist

Every button should have ALL of these:

```tsx
<button className="
  interactive-button          ✓ Adds hover/active states
  rounded-3xl                 ✓ 24px border radius (NOT rounded-2xl!)
  bg-primary-500              ✓ Solid color (primary or secondary)
  px-7 py-3.5                 ✓ 28px x 14px padding
  text-emphasis               ✓ 16px, weight 500
  text-white                  ✓ White text
  shadow-button               ✓ Button shadow
">
```

### ❌ Common Button Mistakes:
- ❌ Using gradients on buttons
- ❌ Using `rounded-2xl` instead of `rounded-3xl`
- ❌ Using arbitrary padding like `p-4` or `px-6 py-3`
- ❌ Missing `shadow-button`
- ❌ Using `font-semibold` instead of `font-medium`
- ❌ Forgetting `interactive-button` class

### Button Variants:

```tsx
// Primary
className="interactive-button rounded-3xl bg-primary-500 px-7 py-3.5 text-emphasis text-white shadow-button"

// Secondary  
className="interactive-button rounded-3xl bg-secondary-500 px-7 py-3.5 text-emphasis text-white shadow-button"

// Ghost
className="interactive-button rounded-3xl border-2 border-dashed border-neutral-100 bg-transparent px-7 py-3.5 text-emphasis text-neutral-900"
```

---

## ✅ Card Checklist

Every card should have ALL of these:

```tsx
<div className="
  rounded-2xl                 ✓ 16px border radius (NOT rounded-xl or rounded-3xl!)
  bg-neutral-50               ✓ Solid neutral background (or other solid semantic color)
  p-4                         ✓ 16px padding (NOT p-5!)
  shadow-card                 ✓ Card shadow
">
```

### ❌ Common Card Mistakes:
- ❌ Using gradients on regular cards (only special cards can have gradients!)
- ❌ Using `rounded-xl` (12px) or `rounded-3xl` (24px) instead of `rounded-2xl` (16px)
- ❌ Using `p-5` (20px) instead of `p-4` (16px)
- ❌ Missing `shadow-card`
- ❌ Using `bg-white` instead of `bg-neutral-50`
- ❌ Forgetting to add `interactive-card` class if clickable

### Card Variants:

```tsx
// Standard card
className="rounded-2xl bg-neutral-50 p-4 shadow-card"

// Colored card (bundles, rewards, moods)
className="rounded-2xl bg-primary-50 p-4 shadow-card"
className="rounded-2xl bg-accent-100 p-4 shadow-card"

// Interactive card (clickable)
className="interactive-card rounded-2xl bg-neutral-50 p-4 shadow-card"

// Special card (challenges, milestones ONLY!)
className="rounded-2xl p-5 shadow-card"
style={{ background: "linear-gradient(to right, #a8c8f0, #c8b8f0)" }}
```

---

## ✅ Badge Checklist

### Difficulty Badges:
```tsx
// Easy
className="inline-flex items-center rounded-[20px] bg-primary-100 px-3 py-1 text-[13px] font-semibold text-primary-700"

// Medium
className="inline-flex items-center rounded-[20px] bg-secondary-100 px-3 py-1 text-[13px] font-semibold text-secondary-900"

// Hard
className="inline-flex items-center rounded-[20px] bg-accent-100 px-3 py-1 text-[13px] font-semibold text-accent-900"
```

### Status Pills:
```tsx
className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-success-700 bg-success-100"
```

### ❌ Common Badge Mistakes:
- ❌ Using `rounded-full` for difficulty badges (should be `rounded-[20px]`)
- ❌ Using wrong font size (should be `text-[13px]` for difficulty)
- ❌ Using wrong font weight (should be `font-semibold`)
- ❌ Wrong padding (`px-3 py-1` for difficulty, `px-2.5 py-1` for status)

---

## ✅ Typography Checklist

Use utility classes instead of arbitrary Tailwind:

```tsx
// ✅ CORRECT - Use utility classes
<h1 className="heading-large">Screen Title</h1>
<h2 className="heading-section">Section Header</h2>
<p className="text-body">Regular paragraph</p>
<span className="text-emphasis">Important label</span>
<span className="text-small">Small label</span>
<span className="text-tiny">Metadata</span>

// ❌ WRONG - Don't use arbitrary classes
<h1 className="text-3xl font-bold">
<p className="text-base">
<span className="text-sm font-medium">
```

### Typography Specs:
```
heading-large:   32px, weight 600, Fraunces (serif)
heading-section: 20px, weight 600, Fraunces (serif)
text-body:       16px, weight 400, Epilogue (sans-serif)
text-emphasis:   16px, weight 500, Epilogue (sans-serif)
text-small:      14px, weight 500, Epilogue (sans-serif)
text-tiny:       13px, weight 400, Epilogue (sans-serif)
```

---

## ✅ Color Token Checklist

### ❌ NEVER Use These:
```tsx
// ❌ Hardcoded hex colors
className="bg-[#74A12E]"
style={{ color: "#F4A6B6" }}

// ❌ Generic Tailwind colors
className="bg-green-500 text-pink-700"

// ❌ Arbitrary opacity on wrong colors
className="bg-white/50 text-gray-700"
```

### ✅ ALWAYS Use Design Tokens:
```tsx
// ✅ Semantic color tokens
className="bg-primary-500 text-neutral-900"
className="bg-accent-50 text-accent-700"
className="bg-secondary-100 text-secondary-900"

// ✅ Correct opacity usage
className="text-neutral-700/70"
```

### Available Color Tokens:
```
Primary:   primary-50, primary-100, primary-500, primary-700, primary-900
Secondary: secondary-50, secondary-100, secondary-500, secondary-700, secondary-900
Success:   success-50, success-100, success-500, success-700, success-900
Warning:   warning-50, warning-100, warning-500, warning-700, warning-900
Accent:    accent-50, accent-100, accent-500, accent-700, accent-900
Neutral:   neutral-50, neutral-100, neutral-500, neutral-700, neutral-900
```

---

## ✅ Spacing Checklist

### Standard Spacing Values:
```tsx
// Card padding
p-4                    // 16px - standard card padding

// Button padding
px-7 py-3.5            // 28px x 14px

// Gaps between cards
gap-3                  // 12px

// Gaps between sections  
gap-6                  // 24px

// Screen edges
px-6                   // 24px horizontal padding
```

### ❌ Common Spacing Mistakes:
- ❌ Using `p-5` on cards (should be `p-4`)
- ❌ Using arbitrary button padding like `px-6 py-2` (should be `px-7 py-3.5`)
- ❌ Using `gap-4` between cards (should be `gap-3`)

---

## ✅ Border Radius Quick Reference

```
Buttons:          rounded-3xl      (24px)
Cards:            rounded-2xl      (16px)
Difficulty Badge: rounded-[20px]   (20px)
Status Pill:      rounded-full     (9999px)
Floating Cat:     rounded-[20px]   (20px)
Small Controls:   rounded-lg       (8px)
```

### Visual Guide:
```
rounded-lg      →  8px    ⌜  ⌝  Small controls
rounded-xl      → 12px    ⌜   ⌝  (Avoid - not in system)
rounded-2xl     → 16px    ⌜    ⌝  Cards
rounded-[20px]  → 20px    ⌜     ⌝  Badges
rounded-3xl     → 24px    ⌜      ⌝  Buttons
rounded-full    → 9999px  ⚪       Pills
```

---

## ✅ Shadow Checklist

```tsx
// Cards
shadow-card                  // Default card shadow
shadow-card-hover            // Hover state (used by interactive-card)
shadow-card-active           // Active state (used by interactive-card)

// Buttons
shadow-button                // Default button shadow
shadow-button-hover          // Hover state (used by interactive-button)
shadow-button-active         // Active state (used by interactive-button)

// Modals
shadow-modal                 // Large shadow for modals
```

### ❌ Common Shadow Mistakes:
- ❌ Forgetting shadows entirely
- ❌ Using arbitrary shadow like `shadow-md` or `shadow-lg`
- ❌ Using wrong shadow type (button shadow on card, or vice versa)

---

## ✅ Gradient Rules

### 🚫 GRADIENTS ARE BANNED ON:
- ❌ Buttons (ALWAYS solid colors)
- ❌ Regular cards (ALWAYS solid colors)
- ❌ Badges
- ❌ Navigation elements

### ✅ GRADIENTS ALLOWED ON:
- ✅ Special cards (challenge bundles, milestone cards)
- ✅ Cat modal background
- ✅ Page background (body)
- ✅ Floating cat button

### Approved Gradient Examples:
```tsx
// Challenge bundle card
style={{ background: "linear-gradient(to right, #a8c8f0, #c8b8f0)" }}

// Reward milestone card
style={{ background: "linear-gradient(to right, #fde8ed, #f5ead0)" }}

// Cat modal
style={{ background: "linear-gradient(to bottom right, #fde8ed, #f0f4e8)" }}

// Floating cat button
style={{ background: "linear-gradient(135deg, #F4A6B6, #d98899)" }}
```

---

## ✅ Interactive States Checklist

### For Buttons:
```tsx
className="interactive-button ..."
```
This class adds:
- Hover: `translateY(-2px)`, brighter shadow, 90% brightness
- Active: `translateY(0)`, subtle shadow, 80% brightness
- Disabled: opacity 50%, no transform

### For Cards (if clickable):
```tsx
className="interactive-card ..."
```
This class adds:
- Hover: `translateY(-2px)`, brighter shadow, 98% brightness
- Active: `translateY(0)`, subtle shadow, 96% brightness

### For Icons:
```tsx
className="interactive-icon ..."
```
This class adds:
- Hover: `scale(1.1)`
- Active: `scale(0.95)`

---

## ✅ Component Layout Checklist

### Container (all pages):
```tsx
<div className="mx-auto max-w-[900px] px-6">
  {/* Page content */}
</div>
```

### Bottom Navigation:
```tsx
<nav className="fixed bottom-0 left-0 right-0 z-40 h-18 border-t border-neutral-100 bg-white/95 backdrop-blur-sm">
  <div className="mx-auto flex h-full max-w-[900px] items-center justify-around px-6">
    {/* Nav items */}
  </div>
</nav>
```

### Floating Cat:
```tsx
<button className="fixed right-6 top-6 z-50 h-14 w-14 rounded-[20px] shadow-card">
  {/* Cat content */}
</button>
```

---

## 🔍 Quick Audit Script

Run these commands to find issues:

```bash
# Find gradients on non-special elements
grep -rn "linear-gradient" src/ --include="*.tsx" | grep -v "special\|challenge\|milestone\|cat\|body"

# Find wrong button border radius
grep -rn 'button.*rounded-(?!3xl)' src/ --include="*.tsx"

# Find wrong card border radius  
grep -rn 'card.*rounded-(?!2xl)' src/ --include="*.tsx"

# Find hardcoded colors
grep -rn "#[0-9a-fA-F]\{6\}" src/ --include="*.tsx"

# Find cards without shadows
grep -rn 'rounded-2xl' src/ --include="*.tsx" | grep -v 'shadow'

# Find buttons without shadows
grep -rn 'rounded-3xl' src/ --include="*.tsx" | grep -v 'shadow'
```

---

## 📝 Before Committing Code

- [ ] No gradients on buttons
- [ ] No gradients on regular cards
- [ ] All buttons use `rounded-3xl`
- [ ] All cards use `rounded-2xl`
- [ ] All difficulty badges use `rounded-[20px]`
- [ ] All buttons have `shadow-button`
- [ ] All cards have `shadow-card`
- [ ] Button padding is `px-7 py-3.5`
- [ ] Card padding is `p-4`
- [ ] Using design system color tokens (no hardcoded hex)
- [ ] Using typography utility classes
- [ ] Interactive elements have `interactive-*` classes
- [ ] No `bg-white`, using `bg-neutral-50` instead
- [ ] Font weights match design system spec

---

## 💡 Pro Tips

1. **Use component library**: Create reusable `<Button>`, `<Card>`, `<Badge>` components
2. **Leverage Tailwind config**: Add design system values to `tailwind.config.js`
3. **Use ESLint rules**: Create custom rules to catch violations
4. **Document exceptions**: If you must break a rule, document why
5. **Regular audits**: Run the audit script weekly to catch drift

---

## 🆘 Need Help?

If you're unsure about a component:
1. Check the design system JSON file
2. Check the fixed examples document
3. Use the utility classes whenever possible
4. When in doubt, use solid colors (no gradients!)

Remember: **Consistency > Perfection**
