---
name: react-19-patterns
description: Modern React 19 development patterns in vite-hono. Use when implementing React 19 features like the use hook, useActionState, useFormStatus, useOptimistic, ref as prop, concurrent rendering, or latest React patterns and performance optimizations.
compability: opencode
---

# React 19 Patterns

Use this skill for modern React 19 development patterns in vite-hono codebase.

## The `use` Hook

Read resources (promises and context) in render:

```tsx
import { use, Suspense } from "react"

function Comments({
  commentsPromise
}: {
  commentsPromise: Promise<Comment[]>
}) {
  const comments = use(commentsPromise)
  return (
    <ul>
      {comments.map(c => (
        <li key={c.id}>{c.text}</li>
      ))}
    </ul>
  )
}

function CommentsPage({
  commentsPromise
}: {
  commentsPromise: Promise<Comment[]>
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  )
}
```

### `use` with Context

```tsx
import { use, createContext } from "react"

const ThemeContext = createContext<"light" | "dark">("light")

function ThemedButton() {
  const theme = use(ThemeContext)
  return (
    <button className={theme === "dark" ? "bg-black" : "bg-white"}>
      Click
    </button>
  )
}
```

## `ref` as a Prop

React 19 allows `ref` as a regular prop:

```tsx
function MyInput({
  placeholder,
  ref
}: {
  placeholder: string
  ref: React.Ref<HTMLInputElement>
}) {
  return <input placeholder={placeholder} ref={ref} />
}

function Parent() {
  const inputRef = useRef<HTMLInputElement>(null)
  return <MyInput ref={inputRef} placeholder="Enter text..." />
}
```

## useActionState Hook

Handle async form submissions with state management:

```tsx
import { useActionState } from "react"

function TodoForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData: FormData) => {
      const title = formData.get("title") as string
      try {
        await createTodo(title)
        return { error: null, success: true }
      } catch {
        return { error: "Failed to create todo", success: false }
      }
    },
    { error: null, success: false }
  )

  return (
    <form action={formAction}>
      <input name="title" type="text" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>
      {state.error && <p className="text-red-500">{state.error}</p>}
    </form>
  )
}
```

## useFormStatus Hook

Access parent form status without prop drilling:

```tsx
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </button>
  )
}

function Form() {
  return (
    <form action={handleAction}>
      <input name="email" type="email" required />
      <SubmitButton />
    </form>
  )
}
```

## useOptimistic Hook

Render optimistic UI updates:

```tsx
import { useOptimistic, useState } from "react"

function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos)
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  )

  const handleSubmit = async (formData: FormData) => {
    const title = formData.get("title") as string
    addOptimisticTodo({ id: "temp", title, completed: false })
    const newTodo = await createTodo(title)
    setTodos(prev => [...prev, newTodo])
  }

  return (
    <div>
      <form action={handleSubmit}>
        <input name="title" placeholder="New todo..." />
        <button type="submit">Add</button>
      </form>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.id === "temp" ? 0.5 : 1 }}>
            {todo.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Suspense with TanStack Query

```tsx
import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense } from "react"

function TodoList() {
  const { data } = useSuspenseQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos
  })
  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

function TodosPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TodoList />
    </Suspense>
  )
}
```

### Parallel Suspense Queries

```tsx
import { useSuspenseQueries } from "@tanstack/react-query"

function Dashboard() {
  const [usersQuery, teamsQuery] = useSuspenseQueries({
    queries: [
      { queryKey: ["users"], queryFn: fetchUsers },
      { queryKey: ["teams"], queryFn: fetchTeams }
    ]
  })

  return (
    <div>
      <UsersList users={usersQuery.data} />
      <TeamsList teams={teamsQuery.data} />
    </div>
  )
}
```

## Performance Patterns

### React.memo

```tsx
const TodoItem = React.memo(function TodoItem({
  todo,
  onToggle
}: {
  todo: Todo
  onToggle: (id: string) => void
}) {
  return <div onClick={() => onToggle(todo.id)}>{todo.title}</div>
})
```

### useMemo and useCallback

```tsx
function TodoList({ items }: { items: Item[] }) {
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.value - b.value),
    [items]
  )
  const handleToggle = useCallback((id: string) => toggleTodo(id), [])

  return (
    <ul>
      {sortedItems.map(item => (
        <TodoItem key={item.id} todo={item} onToggle={handleToggle} />
      ))}
    </ul>
  )
}
```

## Context Pattern

```tsx
import { createContext, use, useState, useCallback } from "react"

const TodoContext = createContext<{
  todos: Todo[]
  addTodo: (title: string) => Promise<void>
} | null>(null)

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([])

  const addTodo = useCallback(async (title: string) => {
    const newTodo = await createTodo(title)
    setTodos(prev => [...prev, newTodo])
  }, [])

  return (
    <TodoContext.Provider value={{ todos, addTodo }}>
      {children}
    </TodoContext.Provider>
  )
}

export function useTodos() {
  const context = use(TodoContext)
  if (!context) throw new Error("useTodos must be used within TodoProvider")
  return context
}
```

## Error Boundary

```tsx
import { ErrorBoundary } from "react-error-boundary"

function ErrorFallback({
  error,
  resetErrorBoundary
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="font-semibold text-red-800">Something went wrong</h2>
      <p className="text-red-600">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 rounded bg-red-600 px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <TodosPage />
    </ErrorBoundary>
  )
}
```

## useTransition

```tsx
function TodoList() {
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  const handleFilterChange = (newFilter: typeof filter) => {
    startTransition(() => setFilter(newFilter))
  }

  return (
    <div>
      <select
        value={filter}
        onChange={e => handleFilterChange(e.target.value as typeof filter)}
        disabled={isPending}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
      {isPending && <span>Updating...</span>}
    </div>
  )
}
```

## useImperativeHandle

```tsx
interface InputHandle {
  focus: () => void
  clear: () => void
}

function TodoInput({
  onSubmit,
  ref
}: {
  onSubmit: (title: string) => void
  ref: React.Ref<InputHandle>
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = ""
    }
  }))

  return (
    <input
      ref={inputRef}
      type="text"
      onKeyDown={e => {
        if (e.key === "Enter" && inputRef.current) {
          onSubmit(inputRef.current.value)
          inputRef.current.value = ""
        }
      }}
    />
  )
}
```
