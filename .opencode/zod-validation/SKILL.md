---
name: zod-validation
description: Schema validation with Zod v4 in the vite-hono codebase. Use when creating validation schemas, integrating Zod with TanStack Form, validating API requests with Hono, type-safe form validation, or any runtime type checking tasks.
compability: opencode
---

# Zod v4 Validation

Use this skill for all validation tasks using Zod v4 across the vite-hono codebase.

## Top-Level Format Validators

Zod v4 provides top-level format validators for better tree-shaking:

```ts
import { z } from "zod"

z.email()
z.url()
z.uuid()
z.emoji()
z.base64()
z.nanoid()
z.cuid()
z.cuid2()
z.ulid()
z.ipv4()
z.ipv6()
z.cidrv4()
z.cidrv6()

// ISO date/time validators
z.iso.date()
z.iso.time()
z.iso.datetime()
z.iso.duration()

// UUID vs GUID
z.uuid() // RFC 9562/4122 compliant (strict)
z.guid() // Any 8-4-4-4-12 hex pattern (permissive)
```

## Basic Schema Definition

### Object Validation

```ts
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(18, "Must be at least 18"),
  email: z.email("Invalid email")
})
```

### Optional and Default Values

```ts
const schema = z.object({
  name: z.string(),
  age: z.number().optional(),
  email: z.email().default("user@example.com")
})
```

### Transformations

```ts
const schema = z.object({
  birthYear: z.coerce.number(),
  name: z.string().transform(val => val.toUpperCase())
})
```

## String Validations

```ts
const stringSchema = z
  .string()
  .min(3, "At least 3 characters")
  .max(100, "At most 100 characters")
  .regex(/^[a-zA-Z]+$/, "Only letters allowed")
  .trim()
  .toLowerCase()
```

## Number Validations

```ts
const numberSchema = z
  .number()
  .min(0, "Must be positive")
  .max(100, "Cannot exceed 100")
  .positive()
  .int("Must be an integer")
  .multipleOf(5)
```

## Arrays and Objects

```ts
const arraySchema = z.array(z.string()).min(1, "At least one item")

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string().regex(/^\d{5}$/, "ZIP must be 5 digits")
})

const userSchema = z.object({
  name: z.string(),
  address: addressSchema
})
```

## Enums and Literals

```ts
const statusSchema = z.enum(["active", "inactive", "pending"])
const typeSchema = z.literal("fixed")

const roleSchema = z.union([
  z.literal("admin"),
  z.literal("user"),
  z.literal("guest")
])
```

## Advanced Patterns

### Discriminated Unions

```ts
const successSchema = z.object({ type: z.literal("success"), data: z.any() })
const errorSchema = z.object({ type: z.literal("error"), message: z.string() })

const resultSchema = z.discriminatedUnion("type", [successSchema, errorSchema])
```

### Refinement

```ts
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(val => /[A-Z]/.test(val), { message: "Must contain uppercase" })
  .refine(val => /[0-9]/.test(val), { message: "Must contain a number" })
```

### Superrefine for Complex Validation

```ts
const formSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string()
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"]
      })
    }
  })
```

### Async Validation

```ts
const uniqueEmailSchema = z.email().refine(
  async email => {
    const exists = await checkEmailExists(email)
    return !exists
  },
  { message: "Email already exists" }
)
```

## TanStack Form Integration

```tsx
import { useAppForm } from "@/hooks/demo.form"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email")
})

function MyForm() {
  const form = useAppForm({
    defaultValues: { name: "", email: "" },
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      await submitForm(value)
    }
  })

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField name="name">
        {field => <field.TextField label="Name" />}
      </form.AppField>
      <form.AppField name="email">
        {field => <field.TextField label="Email" />}
      </form.AppField>
      <form.SubscribeButton label="Submit" />
    </form>
  )
}
```

### Async Validation with Debounce

```tsx
const form = useAppForm({
  defaultValues: { username: "" },
  validators: {
    onChangeAsyncDebounceMs: 500,
    onChangeAsync: async ({ value }) => {
      const exists = await checkUsernameExists(value.username)
      if (exists) return "Username already taken"
    }
  }
})
```

## Hono Backend Integration

### Request Validation

```ts
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  completed: z.boolean().optional()
})

app.post("/api/todos", zValidator("json", todoSchema), c => {
  const todo = c.req.valid("json")
  return c.json({ created: todo }, 201)
})
```

### Query and Param Validation

```ts
const searchSchema = z.object({
  q: z.string().min(1),
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().max(100).optional().default(10)
})

app.get("/api/todos", zValidator("query", searchSchema), c => {
  const { q, page, limit } = c.req.valid("query")
  return c.json({ q, page, limit })
})

app.get(
  "/api/todos/:id",
  zValidator("param", z.object({ id: z.uuid() })),
  c => {
    const { id } = c.req.valid("param")
    return c.json({ id })
  }
)
```

### Custom Error Handling

```ts
app.post(
  "/api/todos",
  zValidator("json", todoSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { error: "Validation failed", issues: result.error.issues },
        400
      )
    }
  }),
  c => c.json({ created: c.req.valid("json") }, 201)
)
```

## Type Inference

```ts
const userSchema = z.object({
  name: z.string(),
  age: z.number()
})

type User = z.infer<typeof userSchema>
// { name: string; age: number; }

// Input vs Output types for transforms
const schema = z.object({
  name: z.string().transform(val => val.toUpperCase()),
  birthYear: z.coerce.number()
})

type SchemaInput = z.input<typeof schema>
type SchemaOutput = z.output<typeof schema>
```

## Common Validation Schemas

```ts
const emailSchema = z.email("Invalid email address")
const urlSchema = z.url("Invalid URL")
const dateSchema = z.coerce.date()
const isoDateSchema = z.iso.date()
const phoneSchema = z.string().regex(/^\+?[\d\s-]+$/, "Invalid phone number")
const ipSchema = z.union([z.ipv4(), z.ipv6()])

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(val => /[A-Z]/.test(val), { message: "Must contain uppercase" })
  .refine(val => /[a-z]/.test(val), { message: "Must contain lowercase" })
  .refine(val => /[0-9]/.test(val), { message: "Must contain a number" })
```

## Error Handling

```ts
const result = schema.safeParse({ name: "" })

if (!result.success) {
  result.error.issues.forEach(issue => {
    console.log(issue.path.join("."), issue.message)
  })
}
```
