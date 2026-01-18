---
name: testing-strategies
description: Testing strategies and patterns in vite-hono codebase. Use when writing unit tests with Vitest, testing React components with @testing-library/react, testing TanStack Query, integration testing Hono endpoints, or setting up E2E tests with Playwright.
---

# Testing Strategies

Use this skill for testing patterns in vite-hono codebase.

## Setup

### Vitest Configuration

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true
  }
})
```

```ts
// src/test/setup.ts
import "@testing-library/jest-dom"
import { cleanup } from "@testing-library/react"

afterEach(() => cleanup())
```

### QueryClient Test Utilities

```tsx
// src/test/test-utils.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

export const TestQueryProvider = ({
  children,
  client = createTestQueryClient()
}: {
  children: React.ReactNode
  client?: QueryClient
}) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
```

## Component Testing

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

describe("Button", () => {
  it("renders and handles click", () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)

    fireEvent.click(screen.getByRole("button", { name: /click me/i }))
    expect(onClick).toHaveBeenCalled()
  })
})

describe("TodoForm", () => {
  it("submits valid form", async () => {
    const handleSubmit = vi.fn()
    render(<TodoForm onSubmit={handleSubmit} />)

    fireEvent.change(screen.getByPlaceholderText("Add a todo..."), {
      target: { value: "Test todo" }
    })
    fireEvent.click(screen.getByRole("button", { name: /add/i }))

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith("Test todo"))
  })
})
```

## Hook Testing

```ts
import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

describe("useTodos", () => {
  it("fetches todos", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestQueryProvider>{children}</TestQueryProvider>
    )

    const { result } = renderHook(() => useTodos(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
```

## Suspense Query Testing

```tsx
import { Suspense } from "react"

describe("TodoList with Suspense", () => {
  it("renders after loading", async () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(["todos"], [{ id: "1", title: "Test Todo" }])

    render(
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>Loading...</div>}>
          <TodoList />
        </Suspense>
      </QueryClientProvider>
    )

    expect(screen.getByText("Test Todo")).toBeInTheDocument()
  })
})
```

## Mutation Testing

```tsx
describe("useCreateTodo", () => {
  it("creates todo", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TestQueryProvider>{children}</TestQueryProvider>
    )

    const { result } = renderHook(() => useCreateTodo(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ title: "New Todo" })
    })

    expect(result.current.isSuccess).toBe(true)
  })
})
```

## Hono Endpoint Testing

```ts
import { describe, it, expect } from "vitest"
import app from "@/app"

describe("Todo API", () => {
  it("GET /api/todos returns todos", async () => {
    const res = await app.request("/api/todos")
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.todos)).toBe(true)
  })

  it("POST /api/todos creates todo", async () => {
    const res = await app.request("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Todo" })
    })
    expect(res.status).toBe(201)
  })
})
```

## Mock Database

```ts
export class MockDatabase {
  private todos: Todo[] = [{ id: "1", title: "Test Todo", completed: false }]

  async findAll() {
    return [...this.todos]
  }
  async findById(id: string) {
    return this.todos.find(t => t.id === id) || null
  }
  async create(todo: CreateTodoDTO) {
    const newTodo = { ...todo, id: crypto.randomUUID(), completed: false }
    this.todos.push(newTodo)
    return newTodo
  }
  reset() {
    this.todos = [{ id: "1", title: "Test Todo", completed: false }]
  }
}
```

## E2E with Playwright

```ts
import { test, expect } from "@playwright/test"

test.describe("Todo App", () => {
  test("creates new todo", async ({ page }) => {
    await page.goto("http://localhost:3000")
    await page.fill('input[placeholder="Add a todo..."]', "New Todo")
    await page.click('button:has-text("Add")')
    await expect(page.getByText("New Todo")).toBeVisible()
  })
})
```

## Mocking

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("with mocked fetch", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  it("fetches todos", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: "1", title: "Test" }]
    } as Response)

    const todos = await fetchTodos()
    expect(todos).toHaveLength(1)
  })
})
```

## Error State Testing

```tsx
describe("Error handling", () => {
  it("displays error on failure", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"))

    render(
      <TestQueryProvider>
        <TodoList />
      </TestQueryProvider>
    )

    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument())
  })
})
```
