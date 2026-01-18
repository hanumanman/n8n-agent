---
name: error-handling-patterns
description: Comprehensive error handling strategies across the vite-hono stack. Use when implementing error boundaries, API error handling, form error display, validation errors, loading states, or error logging in both frontend (React/TanStack) and backend (Hono).
compability: opencode
---

# Error Handling Patterns

Use this skill for implementing error handling across the entire vite-hono stack.

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
      <p className="mt-1 text-red-600">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-3 rounded bg-red-600 px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MainContent />
    </ErrorBoundary>
  )
}
```

## TanStack Query Errors

```tsx
import { useQuery } from "@tanstack/react-query"

function TodoList() {
  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  if (isError) {
    return (
      <div className="text-red-500">
        <p>{error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    )
  }

  if (isLoading) return <div>Loading...</div>
  return (
    <ul>
      {data?.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

### Suspense with Error Boundary

```tsx
import { useSuspenseQuery } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
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
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<div>Loading...</div>}>
        <TodoList />
      </Suspense>
    </ErrorBoundary>
  )
}
```

### Query Error Reset on Navigation

```tsx
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  const { reset } = useQueryErrorResetBoundary()
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = router.subscribe("onBeforeNavigate", () => reset())
    return unsubscribe
  }, [router, reset])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={reset}>
      {children}
    </ErrorBoundary>
  )
}
```

## TanStack Router Errors

```tsx
export const Route = createFileRoute("/posts")({
  loader: () => fetchPosts(),
  errorComponent: ({ error, reset }) => (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p>Error: {error.message}</p>
      <button
        onClick={reset}
        className="mt-2 rounded bg-red-600 px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  )
})
```

## Mutation Errors

```tsx
const mutation = useMutation({
  mutationFn: createTodo,
  onError: error => console.error("Mutation failed:", error),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] })
})

<div>
  <button onClick={() => mutation.mutate({ title: "New" })} disabled={mutation.isPending}>
    {mutation.isPending ? "Creating..." : "Create"}
  </button>
  {mutation.isError && <p className="text-red-500">{mutation.error.message}</p>}
</div>
```

## Form Errors

```tsx
function MyForm() {
  const form = useAppForm({
    defaultValues: { email: "", name: "" },
    validators: { onChange: schema },
    onSubmit: async ({ value }) => await submitForm(value)
  })

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField name="email">
        {field => (
          <div>
            <field.TextField label="Email" />
            {field.state.meta.errors.map((error, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
          </div>
        )}
      </form.AppField>

      <form.Subscribe selector={state => state.errors}>
        {errors =>
          errors.length > 0 && (
            <div className="rounded bg-red-50 p-4 text-red-700">
              {errors.map((error, i) => (
                <p key={i}>{error}</p>
              ))}
            </div>
          )
        }
      </form.Subscribe>

      <form.AppForm>
        <form.SubscribeButton label="Submit" />
      </form.AppForm>
    </form>
  )
}
```

## Backend Errors

```ts
import { HTTPException } from "hono/http-exception"

app.get("/api/users/:id", async c => {
  const user = await findUser(c.req.param("id"))
  if (!user) throw new HTTPException(404, { message: "User not found" })
  return c.json({ user })
})

app.onError((err, c) => {
  console.error("[Error]", err)
  if (err instanceof HTTPException) {
    return c.json({ error: err.message, status: err.status }, err.status)
  }
  return c.json({ error: "Internal Server Error" }, 500)
})

app.notFound(c => c.json({ error: "Not Found", path: c.req.path }, 404))
```

### Validation Errors

```ts
app.post(
  "/api/todos",
  zValidator("json", todoSchema, (result, c) => {
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        errors[issue.path.join(".")] = issue.message
      })
      return c.json({ error: "Validation failed", fields: errors }, 400)
    }
  }),
  c => c.json({ created: c.req.valid("json") }, 201)
)
```

## Loading States

```tsx
// Query
const { isLoading, isFetching, data } = useQuery({ queryKey: ["todos"], queryFn: fetchTodos })

if (isLoading) return <div>Loading...</div>

<div className="relative">
  {isFetching && <div className="absolute inset-0 bg-white/50">Updating...</div>}
  <ul>{data?.map(todo => <li key={todo.id}>{todo.title}</li>)}</ul>
</div>

// Form
<form.Subscribe selector={state => state.meta.isSubmitting}>
  {isSubmitting => <button disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</button>}
</form.Subscribe>

// Mutation
<button onClick={() => mutation.mutate(data)} disabled={mutation.isPending}>
  {mutation.isPending ? "Creating..." : "Create"}
</button>
```

## User-Friendly Errors

```tsx
function ErrorDisplay({
  error,
  onRetry
}: {
  error: Error | string
  onRetry?: () => void
}) {
  const message = typeof error === "string" ? error : error.message

  const getFriendlyMessage = (msg: string) => {
    if (msg.includes("network"))
      return "Connection error. Please check your internet."
    if (msg.includes("timeout")) return "Request timed out. Please try again."
    if (msg.includes("unauthorized")) return "Please log in to continue."
    return msg
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="font-medium text-red-800">Error</p>
      <p className="mt-1 text-red-600">{getFriendlyMessage(message)}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded bg-red-600 px-4 py-2 text-white"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
```

## Error Logging

```ts
// Sentry
import * as Sentry from "@sentry/browser"

app.onError((err, c) => {
  Sentry.captureException(err, {
    extra: { path: c.req.path, method: c.req.method }
  })
  return c.json({ error: "Internal Server Error" }, 500)
})

// Structured
app.onError((err, c) => {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      path: c.req.path,
      method: c.req.method,
      error: err.message,
      stack: err.stack
    })
  )
  return c.json({ error: "Internal Server Error" }, 500)
})
```

## Global Error Context

```tsx
import { createContext, use, useState, useCallback, useEffect } from "react"

const ErrorContext = createContext<{
  addError: (e: Error) => void
  errors: Error[]
} | null>(null)

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<Error[]>([])
  const addError = useCallback(
    (error: Error) => setErrors(prev => [...prev, error]),
    []
  )

  useEffect(() => {
    const handleError = (e: ErrorEvent) => addError(new Error(e.message))
    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [addError])

  return (
    <ErrorContext.Provider value={{ addError, errors }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = use(ErrorContext)
  if (!context) throw new Error("useError must be used within ErrorProvider")
  return context
}
```
