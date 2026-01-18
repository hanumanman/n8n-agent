---
name: tailwind-4-architecture
description: Tailwind CSS 4 architecture and theming patterns in vite-hono. Use when working with utility-first styling, @theme directive, OKLCH color space, dark mode, component variant systems, or Tailwind CSS 4 specific features.
---

# Tailwind CSS 4 Architecture

Use this skill for Tailwind CSS 4 styling and theming in vite-hono codebase.

## CSS-First Configuration

Tailwind CSS 4 uses CSS with the `@theme` directive:

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", "sans-serif";
  --color-primary: oklch(0.5 0.2 250);
  --breakpoint-3xl: 120rem;
}
```

## OKLCH Color Space

```
oklch(L C H)
```

- **Lightness (L)**: 0 to 1 (0 = black, 1 = white)
- **Chroma (C)**: 0 to ~0.4 (color intensity)
- **Hue (H)**: 0 to 360 (color wheel position)

### Defining Colors

```css
@import "tailwindcss";

@theme {
  --color-primary-50: oklch(0.97 0.01 250);
  --color-primary-100: oklch(0.94 0.03 250);
  --color-primary-500: oklch(0.6 0.24 250);
  --color-primary-900: oklch(0.3 0.1 250);

  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.15 0.02 250);
  --color-muted: oklch(0.96 0.01 250);
  --color-muted-foreground: oklch(0.45 0.02 250);
  --color-destructive: oklch(0.58 0.24 27);
  --color-border: oklch(0.91 0.01 250);
}
```

## Dark Mode

### Custom Dark Variant

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

### Theme with Dark Mode

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.15 0.02 250);
  --color-primary: oklch(0.5 0.22 250);
}

.dark {
  --color-background: oklch(0.15 0.02 250);
  --color-foreground: oklch(0.98 0.01 0);
  --color-primary: oklch(0.98 0.01 0);
}
```

### @variant Directive

```css
.my-element {
  background: white;
  @variant dark {
    background: black;
  }
}
```

### Toggle Component

```tsx
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="bg-muted rounded-md px-3 py-2 text-sm"
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  )
}
```

## Class Variance Authority (CVA)

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
)

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ref?: React.Ref<HTMLButtonElement>
}

function Button({ className, variant, size, ref, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}
```

## Common Patterns

### Layout

```tsx
<div className="container mx-auto max-w-6xl px-4">Content</div>

<div className="flex items-center justify-between gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  <Card />
</div>
```

### Typography

```tsx
<h1 className="text-4xl font-bold tracking-tight">Title</h1>
<p className="text-foreground text-base">Paragraph</p>
<p className="text-muted-foreground text-sm">Small text</p>
```

### Responsive

```tsx
<div className="flex flex-col gap-4 md:flex-row">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>

<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
<div className="p-4 sm:p-6 md:p-8 lg:p-10">Responsive padding</div>
```

## Component Styling

### Card

```tsx
function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-lg border shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}
```

### Input

```tsx
function Input({
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "border-input bg-background flex h-10 w-full rounded-md border px-3 py-2",
        "placeholder:text-muted-foreground text-sm",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
```

## cn Utility

```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-classes", isActive && "active-classes", className)} />

<button className={cn("px-4 py-2", isLarge && "px-6 py-3", isActive && "bg-primary")}>
  Button
</button>
```

## Animations

```tsx
import "tw-animate-css"

function Spinner() {
  return (
    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
  )
}

function FadeIn({
  children,
  delay = 0
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
```

## Complete Theme Example

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --radius: 0.5rem;

  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0.02 256);
  --color-primary: oklch(0.205 0.03 256);
  --color-primary-foreground: oklch(0.985 0.002 256);
  --color-secondary: oklch(0.965 0.005 256);
  --color-muted: oklch(0.965 0.005 256);
  --color-muted-foreground: oklch(0.465 0.02 256);
  --color-destructive: oklch(0.577 0.245 27);
  --color-border: oklch(0.915 0.005 256);
  --color-ring: oklch(0.708 0.165 256);
}

.dark {
  --color-background: oklch(0.145 0.02 256);
  --color-foreground: oklch(0.985 0.002 256);
  --color-primary: oklch(0.985 0.002 256);
  --color-primary-foreground: oklch(0.205 0.03 256);
  --color-muted: oklch(0.265 0.03 256);
  --color-muted-foreground: oklch(0.655 0.02 256);
  --color-border: oklch(0.265 0.03 256);
}
```
