# Fixed Component Examples

These are corrected versions of your components that fully comply with the design system.

---

## 1. Fixed: Profile Stats Card (me/page.tsx)

### BEFORE (Incorrect):
```tsx
{/* Stats card */}
<div
  className="rounded-2xl p-5"
  style={{ background: "linear-gradient(135deg, #ffe4fa, #ffc4eb)" }}
>
  <div className="mb-4 text-center">
    <p className="text-sm font-medium text-pink-800/70">
      {profile?.email ?? user.email}
    </p>
    <p className="text-xs text-pink-700/50">
      Member since{" "}
      {profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "—"}
    </p>
  </div>

  <div className="grid grid-cols-3 gap-3">
    <div className="rounded-xl bg-white/50 p-3 text-center">
      <p className="text-xl font-bold text-pink-900">
        {profile?.current_streak ?? 0}
      </p>
      <p className="text-xs text-pink-700/70">Day streak</p>
    </div>
    <div className="rounded-xl bg-white/50 p-3 text-center">
      <p className="text-xl font-bold text-pink-900">
        {profile?.longest_streak ?? 0}
      </p>
      <p className="text-xs text-pink-700/70">Best streak</p>
    </div>
    <div className="rounded-xl bg-white/50 p-3 text-center">
      <p className="text-xl font-bold text-pink-900">{goalsDone ?? 0}</p>
      <p className="text-xs text-pink-700/70">Goals done</p>
    </div>
  </div>
</div>
```

### AFTER (Correct):
```tsx
{/* Stats card */}
<div className="rounded-2xl bg-accent-50 p-4 shadow-card">
  <div className="mb-4 text-center">
    <p className="text-small text-accent-700">
      {profile?.email ?? user.email}
    </p>
    <p className="text-tiny text-accent-700/70">
      Member since{" "}
      {profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "—"}
    </p>
  </div>

  <div className="grid grid-cols-3 gap-3">
    <div className="rounded-2xl bg-neutral-50 p-3 text-center shadow-card">
      <p className="text-xl font-semibold text-accent-900">
        {profile?.current_streak ?? 0}
      </p>
      <p className="text-tiny text-accent-700">Day streak</p>
    </div>
    <div className="rounded-2xl bg-neutral-50 p-3 text-center shadow-card">
      <p className="text-xl font-semibold text-accent-900">
        {profile?.longest_streak ?? 0}
      </p>
      <p className="text-tiny text-accent-700">Best streak</p>
    </div>
    <div className="rounded-2xl bg-neutral-50 p-3 text-center shadow-card">
      <p className="text-xl font-semibold text-accent-900">{goalsDone ?? 0}</p>
      <p className="text-tiny text-accent-700">Goals done</p>
    </div>
  </div>
</div>
```

### Changes Made:
1. ✅ Removed gradient background
2. ✅ Changed to `bg-accent-50` (solid color)
3. ✅ Changed padding from `p-5` to `p-4` (16px)
4. ✅ Added `shadow-card` class
5. ✅ Replaced all `text-pink-*` with `text-accent-*` design tokens
6. ✅ Changed inner cards from `bg-white/50` to `bg-neutral-50`
7. ✅ Changed inner cards from `rounded-xl` to `rounded-2xl` (16px)
8. ✅ Added `shadow-card` to inner stat cards
9. ✅ Used typography utility classes (`text-small`, `text-tiny`)
10. ✅ Fixed text weights to match design system

---

## 2. Reusable Button Component

Create this file: `src/components/ui/button.tsx`

```tsx
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", fullWidth = false, ...props }, ref) => {
    const baseStyles = "interactive-button rounded-3xl px-7 py-3.5 text-emphasis shadow-button";
    
    const variantStyles = {
      primary: "bg-primary-500 text-white hover:bg-primary-700",
      secondary: "bg-secondary-500 text-white hover:bg-secondary-700",
      ghost: "border-2 border-dashed border-neutral-100 bg-transparent text-neutral-900 hover:border-neutral-500",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
```

### Usage:
```tsx
import { Button } from "@/components/ui/button";

// Primary button
<Button variant="primary">Complete Goal</Button>

// Secondary button  
<Button variant="secondary">Save Draft</Button>

// Ghost button
<Button variant="ghost">+ Add Goal</Button>

// Full width
<Button variant="primary" fullWidth>Submit</Button>
```

---

## 3. Reusable Card Component

Create this file: `src/components/ui/card.tsx`

```tsx
import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "standard" | "colored" | "special";
  colorClass?: string; // For colored variant: "bg-primary-50", "bg-accent-100", etc.
  gradient?: string; // For special variant only
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = "standard", 
    colorClass,
    gradient,
    interactive = false,
    ...props 
  }, ref) => {
    const baseStyles = "rounded-2xl p-4 shadow-card";
    
    const variantStyles = {
      standard: "bg-neutral-50",
      colored: colorClass || "bg-neutral-50",
      special: "", // Gradient applied via style prop
    };

    const interactiveClass = interactive ? "interactive-card" : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          interactiveClass,
          className
        )}
        style={variant === "special" && gradient ? { background: gradient } : undefined}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card };
```

### Usage:
```tsx
import { Card } from "@/components/ui/card";

// Standard card
<Card>
  <p>Regular content</p>
</Card>

// Colored card
<Card variant="colored" colorClass="bg-primary-50">
  <p>Primary colored content</p>
</Card>

// Special card with gradient (for challenges/milestones only!)
<Card 
  variant="special" 
  gradient="linear-gradient(to right, #a8c8f0, #c8b8f0)"
>
  <h3>Challenge Bundle</h3>
</Card>

// Interactive card (clickable)
<Card interactive onClick={() => handleClick()}>
  <p>Click me!</p>
</Card>
```

---

## 4. Reusable Badge Component

Create this file: `src/components/ui/badge.tsx`

```tsx
import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: "easy" | "medium" | "hard" | "status";
  statusColor?: "success" | "warning" | "accent";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, statusColor = "success", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center";
    
    const variantStyles = {
      easy: "rounded-[20px] bg-primary-100 px-3 py-1 text-[13px] font-semibold text-primary-700",
      medium: "rounded-[20px] bg-secondary-100 px-3 py-1 text-[13px] font-semibold text-secondary-900",
      hard: "rounded-[20px] bg-accent-100 px-3 py-1 text-[13px] font-semibold text-accent-900",
      status: (() => {
        const statusColors = {
          success: "bg-success-100 text-success-700",
          warning: "bg-warning-100 text-warning-700",
          accent: "bg-accent-100 text-accent-700",
        };
        return `rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[statusColor]}`;
      })(),
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
```

### Usage:
```tsx
import { Badge } from "@/components/ui/badge";

// Difficulty badges
<Badge variant="easy">Easy</Badge>
<Badge variant="medium">Medium</Badge>
<Badge variant="hard">Hard</Badge>

// Status badges
<Badge variant="status" statusColor="success">Active</Badge>
<Badge variant="status" statusColor="warning">Expiring Soon</Badge>
<Badge variant="status" statusColor="accent">Completed</Badge>
```

---

## 5. Cat Modal Fix

### BEFORE (Incorrect):
```tsx
<div
  className="rounded-2xl bg-white p-5"
  style={{ background: "linear-gradient(135deg, #ffe4fa, #ffc4eb)" }}
>
  {/* Cat modal content */}
</div>
```

### AFTER (Correct):
```tsx
<div
  className="rounded-2xl p-5 shadow-modal"
  style={{ 
    background: "linear-gradient(to bottom right, #fde8ed, #f0f4e8)" 
  }}
>
  {/* Cat modal content */}
</div>
```

### Changes:
1. ✅ Fixed gradient direction: `to bottom right` (per design system)
2. ✅ Fixed gradient colors: `#fde8ed` (accent-100) → `#f0f4e8` (primary-50)
3. ✅ Changed shadow to `shadow-modal` for modals
4. ✅ Removed `bg-white` (gradient overrides it anyway)

---

## 6. Example Goal Card

```tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GoalCardProps {
  emoji: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
  onComplete: () => void;
}

export function GoalCard({ 
  emoji, 
  title, 
  difficulty, 
  completed,
  onComplete 
}: GoalCardProps) {
  return (
    <Card interactive>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        
        <div className="flex-1">
          <h3 className="text-body font-medium text-neutral-900">
            {title}
          </h3>
          
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={difficulty}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
            
            {completed && (
              <Badge variant="status" statusColor="success">
                ✓ Completed
              </Badge>
            )}
          </div>
        </div>

        {!completed && (
          <Button 
            variant="primary" 
            onClick={onComplete}
            className="px-4 py-2"
          >
            Done
          </Button>
        )}
      </div>
    </Card>
  );
}
```

---

## 7. Floating Cat Button

```tsx
export function FloatingCat({ healthLevel }: { healthLevel: number }) {
  const getHealthColor = () => {
    if (healthLevel >= 80) return "bg-success-500";
    if (healthLevel >= 50) return "bg-warning-500";
    return "bg-accent-500";
  };

  return (
    <button 
      className="fixed right-6 top-6 z-50 h-14 w-14 overflow-hidden rounded-[20px] shadow-card transition-transform hover:scale-110"
      style={{
        background: "linear-gradient(135deg, #F4A6B6, #d98899)"
      }}
    >
      <div className="flex h-full w-full items-center justify-center text-2xl">
        🐱
      </div>
      
      {/* Health indicator dot */}
      <div className="absolute right-1 top-1">
        <div className={`h-2 w-2 rounded-full ${getHealthColor()}`} />
      </div>
    </button>
  );
}
```

### Changes:
1. ✅ Size: `h-14 w-14` (56px = 14 * 4px)
2. ✅ Border radius: `rounded-[20px]` (per design system)
3. ✅ Gradient: Pink to rose (accent colors)
4. ✅ Shadow: `shadow-card`
5. ✅ Hover: `scale-110` interaction
6. ✅ Health dot using semantic colors

---

## 8. Bottom Navigation

```tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, FileText, Gift, User } from "phosphor-react";

const navItems = [
  { href: "/home", label: "Today", Icon: Home },
  { href: "/goals", label: "Goals", Icon: Target },
  { href: "/reflect", label: "Reflect", Icon: FileText },
  { href: "/rewards", label: "Rewards", Icon: Gift },
  { href: "/me", label: "Me", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-18 border-t border-neutral-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-[900px] items-center justify-around px-6">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 transition-transform active:scale-95"
            >
              <Icon 
                size={22}
                weight={isActive ? "fill" : "regular"}
                className={`interactive-icon ${
                  isActive ? "text-primary-500" : "text-neutral-700"
                }`}
              />
              <span 
                className={`text-xs font-medium ${
                  isActive ? "text-primary-500" : "text-neutral-700"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Design System Compliance:
1. ✅ Height: `h-18` (72px)
2. ✅ Background: `bg-white/95 backdrop-blur-sm`
3. ✅ Border: `border-t border-neutral-100`
4. ✅ Icon size: `22px`
5. ✅ Icons: Outline default, filled when active
6. ✅ Label: `text-xs font-medium` (12px, weight 500)
7. ✅ Active color: `text-primary-500`
8. ✅ Inactive color: `text-neutral-700`
9. ✅ Interaction: Icons scale on tap

---

## Summary of All Fixes

### Global Changes Needed:
1. Replace all inline gradients on regular cards with solid `bg-*` classes
2. Add `shadow-card` to all cards
3. Add `shadow-button` to all buttons  
4. Change all buttons to `rounded-3xl`
5. Change all cards to `rounded-2xl`
6. Replace all hardcoded hex colors with design system tokens
7. Fix padding: cards `p-4`, buttons `px-7 py-3.5`
8. Use typography utility classes instead of arbitrary Tailwind classes

### Component Library Benefits:
- Automatic design system compliance
- Single source of truth for styling
- Easy to update globally
- Type-safe props
- Better developer experience
- Prevents future drift

Would you like me to generate the complete fixed version of any specific file?
