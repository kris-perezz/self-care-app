# Design System Inconsistency Report & Fix Guide

## Executive Summary

Based on analysis of your codebase against your design system specification, I've identified **6 critical inconsistency categories** that need to be addressed. This document provides specific examples and actionable fixes for each issue.

---

## 🔴 Critical Issues

### 1. **Gradient Misuse on Cards** (HIGH PRIORITY)

**Design System Rule:**
- Regular cards: SOLID backgrounds only (neutral.50)
- Special cards only (challenges, milestones): Can use gradients
- **"Buttons never have gradients - always solid colors"**
- **"Regular cards never have gradients - solid only"**

**Current Violations:**

#### Issue 1.1: Profile Stats Card Using Gradient
**File:** `src/app/(protected)/me/page.tsx` (Line 2070)
```tsx
// ❌ WRONG - Using gradient on regular card
<div
  className="rounded-2xl p-5"
  style={{ background: "linear-gradient(135deg, #ffe4fa, #ffc4eb)" }}
>
```

**Fix:**
```tsx
// ✅ CORRECT - Use solid accent color
<div className="rounded-2xl bg-accent-50 p-5 shadow-card">
```

#### Issue 1.2: Cat Modal Background Using Wrong Gradient
**File:** `src/app/(protected)/me/settings/page.tsx` (Lines 1544, 2270, 2476, 2488)
```tsx
// ❌ WRONG - Incorrect gradient colors
style={{ background: "linear-gradient(135deg, #ffe4fa, #ffc4eb)" }}
```

**Fix:** Use the design system's specified Cat Modal gradient
```tsx
// ✅ CORRECT - Per design system specialGradients
style={{ 
  background: "linear-gradient(to bottom right, #fde8ed, #f0f4e8)" 
}}
```

**Design System Reference:**
```json
"Cat Modal Pink-Matcha": {
  "usage": "Cat interaction modal",
  "colors": ["#fde8ed", "#f0f4e8"],
  "direction": "to bottom right"
}
```

---

### 2. **Border Radius Inconsistencies** (MEDIUM PRIORITY)

**Design System Specification:**
- Cards: `16px` (rounded-2xl in Tailwind = 16px) ✅
- Buttons: `24px` (rounded-3xl in Tailwind = 24px) 
- Badges: `20px` for difficulty, `full` for status pills

**Current Issues:**

#### Issue 2.1: Mixed Button Border Radius
Some buttons use `rounded-3xl` (correct) but others use `rounded-2xl` or `rounded-xl`.

**Search Pattern to Find:**
```bash
grep -n "button.*rounded-[^3]" src/
```

**Fix:** Standardize all primary/secondary buttons to `rounded-3xl`
```tsx
// ❌ WRONG
<button className="... rounded-2xl ...">

// ✅ CORRECT
<button className="... rounded-3xl ...">
```

#### Issue 2.2: Badge Border Radius
**Check:** Difficulty badges should use `rounded-[20px]` not `rounded-full` or `rounded-2xl`

```tsx
// ❌ WRONG
<span className="rounded-full px-3 py-1">Easy</span>

// ✅ CORRECT  
<span className="rounded-[20px] px-3 py-1">Easy</span>
```

---

### 3. **Typography Weight Inconsistencies** (MEDIUM PRIORITY)

**Design System Specification:**
- Heading Large: weight `600`
- Heading Section: weight `600`
- Body: weight `400`
- Emphasis: weight `500`
- Small: weight `500`
- Tiny: weight `400`

**Common Issues:**

#### Issue 3.1: Button Text Weight
Buttons should use `font-medium` (500) not `font-semibold` (600)

```tsx
// ❌ WRONG
<button className="... font-semibold ...">

// ✅ CORRECT
<button className="... font-medium ..."> // or use text-emphasis class
```

#### Issue 3.2: Badge Text Weight
**File:** Check difficulty badges
```tsx
// ✅ CORRECT - Per design system
<span className="... text-[13px] font-semibold ...">Easy</span>
```
This is actually correct! Badges use 600 weight.

---

### 4. **Color Token Usage** (HIGH PRIORITY)

**Design System Rule:** Use semantic color tokens, not arbitrary hex values

**Current Violations:**

#### Issue 4.1: Hardcoded Pink Colors
**File:** `src/app/(protected)/me/page.tsx`
```tsx
// ❌ WRONG - Using arbitrary colors
<p className="text-pink-800/70">
<p className="text-pink-700/50">
<p className="text-pink-900">
```

**Fix:** Use design system tokens
```tsx
// ✅ CORRECT
<p className="text-accent-700">
<p className="text-accent-700/70">  
<p className="text-accent-900">
```

#### Issue 4.2: Background Color Opacity
```tsx
// ❌ WRONG
<div className="bg-white/50">

// ✅ CORRECT - Use neutral-50 with proper opacity or solid neutral-100
<div className="bg-neutral-100/80">
```

---

### 5. **Spacing Inconsistencies** (MEDIUM PRIORITY)

**Design System Specification:**
- Card padding: `16px` (p-4)
- Card gap: `12px` (gap-3)
- Section gap: `24px` (gap-6)
- Screen padding: `24px` (px-6)

**Check for:**

```tsx
// ❌ WRONG - Card with 20px padding
<div className="rounded-2xl p-5">

// ✅ CORRECT - Use 16px
<div className="rounded-2xl p-4">
```

**Current Violation:**
- Line 2070 in me/page.tsx uses `p-5` (20px) instead of `p-4` (16px)

---

### 6. **Shadow Usage** (MEDIUM PRIORITY)

**Design System Specification:**
- Cards: `shadow-card`
- Buttons: `shadow-button`
- Interactive states use `shadow-card-hover` / `shadow-button-hover`

**Check for Missing Shadows:**

```tsx
// ❌ WRONG - Card without shadow
<div className="rounded-2xl bg-white p-4">

// ✅ CORRECT
<div className="rounded-2xl bg-white p-4 shadow-card">
```

---

## 📋 Component-Specific Fixes

### Button Component Checklist

Create or update your button components to match these specs:

```tsx
// Primary Button
<button className="
  interactive-button 
  rounded-3xl 
  bg-primary-500 
  px-7 py-3.5 
  text-emphasis 
  text-white 
  shadow-button
">
  Button Text
</button>

// Secondary Button  
<button className="
  interactive-button
  rounded-3xl
  bg-secondary-500
  px-7 py-3.5
  text-emphasis
  text-white
  shadow-button
">
  Button Text
</button>

// Ghost Button (Add Goal)
<button className="
  interactive-button
  rounded-3xl
  border-2 border-dashed border-neutral-100
  bg-transparent
  px-7 py-3.5
  text-emphasis
  text-neutral-900
">
  + Add Goal
</button>
```

### Card Component Checklist

```tsx
// Standard Card
<div className="
  rounded-2xl 
  bg-neutral-50 
  p-4 
  shadow-card
  [optional: border-2 border-neutral-100]
">
  Card Content
</div>

// Colored Card (for bundles, rewards, moods)
<div className="
  rounded-2xl
  bg-primary-50
  p-4
  shadow-card
">
  Card Content
</div>

// Special Card (challenges, milestones) - GRADIENTS ALLOWED
<div 
  className="rounded-2xl p-5 shadow-card"
  style={{ 
    background: "linear-gradient(to right, #a8c8f0, #c8b8f0)" 
  }}
>
  Special Card Content
</div>
```

### Badge Component Checklist

```tsx
// Difficulty Badge - Easy
<span className="
  inline-flex
  items-center
  rounded-[20px]
  bg-primary-100
  px-3 py-1
  text-[13px]
  font-semibold
  text-primary-700
">
  Easy
</span>

// Difficulty Badge - Medium
<span className="
  inline-flex
  items-center
  rounded-[20px]
  bg-secondary-100
  px-3 py-1
  text-[13px]
  font-semibold
  text-secondary-900
">
  Medium
</span>

// Difficulty Badge - Hard
<span className="
  inline-flex
  items-center  
  rounded-[20px]
  bg-accent-100
  px-3 py-1
  text-[13px]
  font-semibold
  text-accent-900
">
  Hard
</span>

// Status Pill
<span className="
  inline-flex
  items-center
  rounded-full
  bg-success-100
  px-2.5 py-1
  text-xs
  font-semibold
  text-success-700
">
  Active
</span>
```

---

## 🔧 Quick Fix Commands

### 1. Find All Gradient Usage on Non-Special Cards
```bash
grep -rn "linear-gradient" src/ --include="*.tsx" | grep -v "special\|challenge\|milestone"
```

### 2. Find Hardcoded Color Values
```bash
grep -rn "#[0-9a-fA-F]\{6\}" src/ --include="*.tsx"
```

### 3. Find Incorrect Button Border Radius
```bash
grep -rn 'button.*className.*rounded-(?!3xl)' src/ --include="*.tsx"
```

### 4. Find Cards Without Shadows
```bash
grep -rn 'className.*rounded-2xl' src/ --include="*.tsx" | grep -v 'shadow'
```

---

## 🎯 Priority Action Plan

### Phase 1: Critical Fixes (Do First)
1. ✅ Remove all gradients from regular cards
2. ✅ Fix cat modal gradient to use correct colors
3. ✅ Replace all hardcoded pink/color hex values with design tokens
4. ✅ Standardize all button border-radius to `rounded-3xl`

### Phase 2: Consistency Fixes (Do Next)
5. ✅ Fix card padding from `p-5` to `p-4` 
6. ✅ Add missing `shadow-card` to all cards
7. ✅ Add missing `shadow-button` to all buttons
8. ✅ Standardize badge border-radius to `rounded-[20px]`

### Phase 3: Polish (Do Last)
9. ✅ Verify all typography weights match spec
10. ✅ Verify all spacing values match spec
11. ✅ Create reusable component library to prevent future drift

---

## 📝 Files That Need Immediate Attention

Based on the analysis, prioritize these files:

1. **`src/app/(protected)/me/page.tsx`**
   - Line 2070: Remove gradient, use `bg-accent-50`
   - Lines 2074, 2077, etc.: Replace pink-* with accent-* tokens
   - Line 2089-2103: Use `bg-neutral-50` instead of `bg-white/50`
   - Fix padding from `p-5` to `p-4`

2. **`src/app/(protected)/me/settings/page.tsx`**
   - Lines 1544, 2270, 2476, 2488: Fix cat modal gradient colors

3. **Search all button components** for:
   - Non-`rounded-3xl` border radius
   - Missing `shadow-button` class
   - Incorrect font weight

4. **Search all card components** for:
   - Gradient usage (except special cards)
   - Missing `shadow-card` class
   - Non-`rounded-2xl` border radius
   - Incorrect padding

---

## ✅ Validation Checklist

After making fixes, verify:

- [ ] No buttons have gradients
- [ ] No regular cards have gradients  
- [ ] All buttons use `rounded-3xl` (24px)
- [ ] All cards use `rounded-2xl` (16px)
- [ ] All difficulty badges use `rounded-[20px]`
- [ ] No hardcoded hex colors (use design tokens)
- [ ] All cards have `shadow-card`
- [ ] All buttons have `shadow-button`
- [ ] Card padding is `p-4` (16px)
- [ ] Button padding is `px-7 py-3.5` (28px x 14px)
- [ ] Button text uses `text-emphasis` or `font-medium`
- [ ] Typography weights match design system

---

## 🎨 Design System Quick Reference

### Colors (Most Used)
```css
Primary (Matcha Green): primary-50/100/500/700/900
Secondary (Hojicha Tan): secondary-50/100/500/700/900  
Accent (Dusty Rose): accent-50/100/500/700/900
Neutral (Warm): neutral-50/100/500/700/900
```

### Border Radius
```
Cards: rounded-2xl (16px)
Buttons: rounded-3xl (24px)
Difficulty Badges: rounded-[20px] (20px)
Status Pills: rounded-full
```

### Spacing
```
Card padding: p-4 (16px)
Button padding: px-7 py-3.5 (28px x 14px)
Card gaps: gap-3 (12px)
Section gaps: gap-6 (24px)
```

### Typography
```
Large Title: heading-large (32px, weight 600, Fraunces)
Section Title: heading-section (20px, weight 600, Fraunces)
Body: text-body (16px, weight 400, Epilogue)
Emphasis: text-emphasis (16px, weight 500, Epilogue)
Small: text-small (14px, weight 500, Epilogue)
Tiny: text-tiny (13px, weight 400, Epilogue)
```

---

## 💡 Preventing Future Drift

**Recommendation:** Create a component library with these pre-built components:

1. `<Button variant="primary" | "secondary" | "ghost">`
2. `<Card variant="standard" | "colored" | "special">`
3. `<Badge variant="easy" | "medium" | "hard" | "status">`

This will enforce design system compliance automatically.

---

## Need Help?

If you need assistance with any specific component or want me to generate the fixed code for any file, let me know which file and I'll provide the corrected version!
