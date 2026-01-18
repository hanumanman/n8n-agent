---
name: typescript-strict
description: Advanced TypeScript patterns for strict mode development in vite-hono. Use when creating type-safe API contracts, shared types between frontend/backend, type inference strategies, runtime type validation, or advanced TypeScript patterns.
compability: opencode
---

# TypeScript Strict Mode

Use this skill for advanced TypeScript patterns in vite-hono codebase.

## Type-Safe API Contracts

### Define Shared Types

```ts
// packages/shared/src/types/todo.ts
export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

export interface CreateTodoDTO {
  title: string
}

export interface UpdateTodoDTO {
  title?: string
  completed?: boolean
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}
```

### Use Types Across Frontend and Backend

```tsx
// Frontend component
import type { Todo } from "@shared/types/todo"

function TodoItem({ todo }: { todo: Todo }) {
  return <div>{todo.title}</div>
}
```

```ts
// Backend route
import type { Todo, CreateTodoDTO } from "@shared/types/todo"

app.post("/api/todos", async c => {
  const body: CreateTodoDTO = await c.req.json()
  const todo: Todo = await createTodo(body)
  return c.json({ data: todo })
})
```

## TanStack Query Type Safety

### Type-Safe Query Options

```ts
import { queryOptions } from "@tanstack/react-query"

function postsQueryOptions() {
  return queryOptions({
    queryKey: ["posts"],
    queryFn: async (): Promise<Post[]> => {
      const response = await fetch("/api/posts")
      return response.json()
    }
  })
}

const { data } = useQuery(postsQueryOptions())
// data is automatically typed as Post[] | undefined
```

### Type-Safe Mutations

```ts
const mutation = useMutation({
  mutationFn: async (data: CreateTodoDTO): Promise<Todo> => {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    return response.json()
  }
})
```

## Type Inference from Zod

### Infer TypeScript Types from Zod Schemas

```ts
import { z } from "zod"

const todoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  completed: z.boolean()
})

type Todo = z.infer<typeof todoSchema>
// { id: string; title: string; completed: boolean; }

function processTodo(todo: Todo) {
  console.log(todo.title) // Type-safe access
}
```

### Input vs Output Types

```ts
const createUserSchema = z.object({
  password: z.string().min(8),
  birthYear: z.coerce.number()
})

type CreateUserInput = z.input<typeof createUserSchema>
// { password: string; birthYear: string | number }

type CreateUserOutput = z.output<typeof createUserSchema>
// { password: string; birthYear: number }
```

## Utility Types

### Common Utility Types

```ts
// Make all properties optional
type PartialTodo = Partial<Todo>

// Make all properties required
type RequiredTodo = Required<Partial<Todo>>

// Pick specific properties
type TodoSummary = Pick<Todo, "id" | "title">

// Omit specific properties
type TodoPublic = Omit<Todo, "createdAt">

// Extract type from array
type Todos = Todo[]

// Extract type from Promise
type TodoResponse = Promise<ApiResponse<Todo>>

// Make specific properties optional
type TodoUpdate = Partial<Pick<Todo, "title" | "completed">>
```

### Custom Utility Types

```ts
// Deep partial
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

// Deep readonly
type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>
    }
  : T

// Extract promise value
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

// Extract array element
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never
```

## Generic Types

### Generic Functions

```ts
function ApiResponse<T>(data: T): ApiResponse<T> {
  return { data, success: true }
}

const response = ApiResponse<Todo>({
  id: "1",
  title: "Test",
  completed: false,
  createdAt: new Date()
})
// response.data is typed as Todo
```

### Generic Components

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

;<List items={todos} renderItem={todo => <span>{todo.title}</span>} />
```

## Type Guards

### Runtime Type Guards

```ts
function isTodo(value: unknown): value is Todo {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value &&
    "completed" in value
  )
}

function processValue(value: unknown) {
  if (isTodo(value)) {
    console.log(value.title) // TypeScript knows this is a Todo
  }
}
```

### Discriminated Unions

```ts
type Result = { success: true; data: Todo } | { success: false; error: string }

function handleResult(result: Result) {
  if (result.success) {
    console.log(result.data.title) // TypeScript knows data exists
  } else {
    console.log(result.error) // TypeScript knows error exists
  }
}
```

## Hono Type Safety

### Typed Context

```ts
type Env = {
  Bindings: {
    DB: D1Database
    API_KEY: string
  }
  Variables: {
    userId: string
  }
}

const app = new Hono<Env>()

app.get("/api/todos", async c => {
  const db = c.env.DB // Type-safe access
  const userId = c.var.userId // Type-safe access
  const todos = await db.select().from(todosTable)
  return c.json(todos)
})
```

### Typed Request Body

```ts
app.post("/api/todos", async c => {
  const body = await c.req.json<CreateTodoDTO>()
  // body is typed as CreateTodoDTO
})
```

### Typed Response

```ts
app.get("/api/todos", async c => {
  const todos: Todo[] = await getTodos()
  return c.json<ApiResponse<Todo[]>>({ data: todos, success: true })
})
```

## Router Type Safety

### Route Parameter Types

```ts
const todosRouter = new Hono()
  .get("/", c => c.json({ todos: [] }))
  .post("/", c => c.json({ created: true }))
  .get("/:id", async c => {
    const id = c.req.param("id")
    const todo = await findTodo(id!)
    return c.json({ todo })
  })

app.route("/api/todos", todosRouter)
```

## Form Type Safety

### Typed Form Values

```tsx
import { useAppForm } from "@/hooks/demo.form"

const form = useAppForm<TodoFormData>({
  defaultValues: {
    title: "",
    description: ""
  },
  onSubmit: async ({ value }) => {
    // value is typed as TodoFormData
    await createTodo(value)
  }
})
```

### Typed Field Access

```tsx
<form.AppField name="title" validators={{ onBlur: z.string().min(1) }}>
  {field => (
    <>
      <field.TextField label="Title" />
      {field.state.meta.touched &&
        field.state.meta.errors.map(error => <span key={error}>{error}</span>)}
    </>
  )}
</form.AppField>
```

## Advanced Patterns

### Branded Types

```ts
type UserId = string & { readonly __brand: "UserId" }
type Email = string & { readonly __brand: "Email" }

function createUserId(id: string): UserId {
  return id as UserId
}

function sendEmail(to: Email) {
  // Type-safe email sending
}

const userId = createUserId("user-123")
sendEmail("test@example.com" as Email)
```

### Template Literal Types

```ts
type EventName = "user:created" | "user:deleted" | "todo:added"

function onEvent(eventName: EventName, handler: () => void) {
  // Only accepts valid event names
}

onEvent("user:created", () => {})
onEvent("invalid:event", () => {}) // TypeScript error
```

### Conditional Types

```ts
type ApiResult<T> = T extends string
  ? { text: T }
  : T extends number
    ? { number: T }
    : { data: T }

const result1: ApiResult<string> = { text: "hello" }
const result2: ApiResult<number> = { number: 123 }
const result3: ApiResult<object> = { data: {} }
```

### Mapped Types

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

interface Todo {
  title: string
  completed: boolean
}

type TodoGetters = Getters<Todo>
// { getTitle: () => string; getCompleted: () => boolean }
```

## Type Imports

### Import Types Only

```ts
// Only import the type, not the value
import type { Todo } from "@shared/types/todo"

// Import both type and value
import { Todo, createTodo } from "@shared/types/todo"
```

### Export Types

```ts
// Export a type
export type { Todo } from "./types"

// Export multiple types
export type { Todo, User, Post } from "./types"
```

## Type Narrowing

### Type Guards

```ts
function isString(value: unknown): value is string {
  return typeof value === "string"
}

function processValue(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()) // TypeScript knows this is a string
  }
}
```

### Discriminated Unions

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2
    case "square":
      return shape.side ** 2
  }
}
```

For comprehensive TypeScript patterns, see [references/advanced-typescript.md](references/advanced-typescript.md)
