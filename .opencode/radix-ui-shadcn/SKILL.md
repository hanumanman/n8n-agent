---
name: radix-ui-shadcn
description: Component development with Radix UI primitives and Shadcn UI patterns in the vite-hono codebase. Use when creating UI components, using headless primitives, implementing compound components, working with slot patterns, or customizing Shadcn components in packages/fe/src/components/ui/.
compability: opencode
---

# Radix UI + Shadcn UI

Use this skill when working with UI components in `packages/fe/src/components/ui/`.

## Slot Pattern (asChild)

```tsx
import { Slot } from "@radix-ui/react-slot"

function Button({
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"
  return <Comp {...props} />
}

;<Button asChild>
  <a href="/about">About</a>
</Button>
```

## Compound Components

```tsx
import * as Select from "@radix-ui/react-select"
;<Select.Root>
  <Select.Trigger>
    <Select.Value placeholder="Select option" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content>
      <Select.Item value="1">Option 1</Select.Item>
      <Select.Item value="2">Option 2</Select.Item>
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

## Shadcn Button with CVA

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

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

## Accessible Components

### Switch

```tsx
import * as Switch from "@radix-ui/react-switch"

function MySwitch() {
  const [checked, setChecked] = useState(false)
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={setChecked}
      className="bg-muted data-[state=checked]:bg-primary h-6 w-11 rounded-full"
    >
      <Switch.Thumb className="block h-5 w-5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5" />
    </Switch.Root>
  )
}
```

### Slider

```tsx
import * as Slider from "@radix-ui/react-slider"

function MySlider() {
  const [values, setValues] = useState([50])
  return (
    <Slider.Root
      value={values}
      onValueChange={setValues}
      max={100}
      step={1}
      className="relative flex h-5 w-full items-center"
    >
      <Slider.Track className="bg-muted relative h-1 w-full grow rounded-full">
        <Slider.Range className="bg-primary absolute h-full rounded-full" />
      </Slider.Track>
      <Slider.Thumb className="bg-primary block h-5 w-5 rounded-full shadow" />
    </Slider.Root>
  )
}
```

### Label

```tsx
import * as Label from "@radix-ui/react-label"

function TextField({
  label,
  id,
  ...props
}: {
  label: string
  id: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label.Root htmlFor={id}>{label}</Label.Root>
      <input id={id} {...props} />
    </div>
  )
}
```

## Dialog

```tsx
import * as Dialog from "@radix-ui/react-dialog"

function CustomDialog({
  children,
  open,
  onOpenChange
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="bg-background fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 shadow-lg">
          {children}
          <Dialog.Close className="absolute top-4 right-4">X</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

## Context Pattern

```tsx
import { createContext, use, useState } from "react"

const FormContext = createContext<{
  values: Record<string, string>
  setValue: (name: string, value: string) => void
} | null>(null)

function Form({
  children,
  onSubmit
}: {
  children: React.ReactNode
  onSubmit: (values: Record<string, string>) => void
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  const setValue = (name: string, value: string) =>
    setValues(prev => ({ ...prev, [name]: value }))

  return (
    <FormContext.Provider value={{ values, setValue }}>
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit(values)
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  )
}

function Field({ name }: { name: string }) {
  const context = use(FormContext)
  if (!context) throw new Error("Field must be used within Form")
  return (
    <input
      value={context.values[name] || ""}
      onChange={e => context.setValue(name, e.target.value)}
    />
  )
}
```

## Existing Components

`src/components/ui/`:

- `button.tsx` - Slot + CVA variants
- `input.tsx` - Styled input
- `label.tsx` - Radix label
- `select.tsx` - Radix select
- `slider.tsx` - Radix slider
- `switch.tsx` - Radix switch
- `textarea.tsx` - Styled textarea

## Styling

```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-classes", isActive && "active-classes", className)} />

// Tailwind merge resolves conflicts
<button className={cn("px-4", "px-6")}>{/* Renders px-6 */}</button>
```

## Data Attributes

```css
[data-state="checked"] {
  background-color: var(--primary);
}
[data-state="open"] {
  animation: fadeIn 200ms ease-out;
}
```

## Animations

```tsx
<Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
  Content
</Dialog.Content>
```
