---
name: tanstack-ecosystem
description: Expert guidance for TanStack Router, Query, and Form in the vite-hono codebase. Use when working with routing, data fetching, caching, mutations, form validation, or any TanStack-related features including file-based routing, loaders, route contexts, optimistic updates, infinite queries, and form state management.
---

# TanStack Ecosystem

Use this skill when working with TanStack Router, TanStack Query, and TanStack Form in the vite-hono codebase.

## TanStack Router

### File-Based Routing

```tsx
// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Index
})

function Index() {
  return <div>Home</div>
}
```

### Loaders

```tsx
export const Route = createFileRoute("/posts")({
  loader: async () => await fetchPosts(),
  component: Posts
})

function Posts() {
  const posts = Route.useLoaderData()
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### Route Context

```tsx
// __root.tsx
interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Root
})

// In routes
loader: ({ context }) => context.queryClient.ensureQueryData(postsQueryOptions)
```

### Navigation

```tsx
import { useRouter, Link } from "@tanstack/react-router"

const router = useRouter()
router.navigate({ to: "/posts/$postId", params: { postId: "1" } })

<Link to="/posts/$postId" params={{ postId: "1" }}>View Post</Link>
```

### Error Handling

```tsx
export const Route = createFileRoute("/posts")({
  loader: () => fetchPosts(),
  errorComponent: ({ error, reset }) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
})
```

## TanStack Query

### Basic Query

```tsx
import { useQuery } from "@tanstack/react-query"

function TodoList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return (
    <ul>
      {data?.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

### Suspense Query

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

### Mutations

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query"

function CreateTodo() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] })
  })

  return (
    <button
      onClick={() => mutation.mutate({ title: "New Todo" })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Creating..." : "Create Todo"}
    </button>
  )
}
```

### Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: createTodo,
  onMutate: async newTodo => {
    await queryClient.cancelQueries({ queryKey: ["todos"] })
    const previousTodos = queryClient.getQueryData(["todos"])
    queryClient.setQueryData(["todos"], (old: Todo[]) => [
      ...old,
      { id: Date.now(), ...newTodo }
    ])
    return { previousTodos }
  },
  onError: (err, newTodo, context) =>
    queryClient.setQueryData(["todos"], context?.previousTodos),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ["todos"] })
})
```

### Infinite Queries

```tsx
import { useInfiniteQuery } from "@tanstack/react-query"

function ProjectList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["projects"],
      queryFn: ({ pageParam }) => fetchProjects(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.hasMore ? allPages.length : undefined
    })

  return (
    <div>
      {data?.pages.flatMap(page =>
        page.projects.map(p => <div key={p.id}>{p.name}</div>)
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  )
}
```

### Query Options Factory

```tsx
import { queryOptions } from "@tanstack/react-query"

const todosQueryOptions = queryOptions({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  staleTime: 1000 * 60 * 5
})

const todoQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["todos", id],
    queryFn: () => fetchTodo(id)
  })
```

## TanStack Form

### Basic Form

```tsx
import { useAppForm } from "@/hooks/demo.form"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1),
  email: z.email()
})

function MyForm() {
  const form = useAppForm({
    defaultValues: { name: "", email: "" },
    validators: { onBlur: schema },
    onSubmit: async ({ value }) => await submitData(value)
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
      <form.AppForm>
        <form.SubscribeButton label="Submit" />
      </form.AppForm>
    </form>
  )
}
```

### Async Validation

```tsx
const form = useAppForm({
  defaultValues: { username: "" },
  validators: {
    onChangeAsyncDebounceMs: 500,
    onChangeAsync: async ({ value }) => {
      const exists = await checkUsernameExists(value.username)
      if (exists) return { fields: { username: "Username taken" } }
    }
  }
})
```

### Form State Subscription

```tsx
<form.Subscribe selector={state => state.meta.isSubmitting}>
  {isSubmitting => (
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  )}
</form.Subscribe>

<form.Subscribe selector={state => state.errors}>
  {errors => errors.length > 0 && <div className="text-red-500">{errors.map((e, i) => <p key={i}>{e}</p>)}</div>}
</form.Subscribe>
```

## Integration Patterns

### Router + Query

```tsx
export const Route = createFileRoute("/posts")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(postsQueryOptions)
})

function Posts() {
  const { data } = useSuspenseQuery(postsQueryOptions)
  return <PostList posts={data} />
}
```

### Form + Mutation

```tsx
function CreateTodoForm() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] })
  })

  const form = useAppForm({
    defaultValues: { title: "" },
    onSubmit: async ({ value }) => await mutation.mutateAsync(value)
  })

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField name="title">
        {field => <field.TextField label="Title" />}
      </form.AppField>
      <form.AppForm>
        <form.SubscribeButton
          label={mutation.isPending ? "Creating..." : "Create"}
        />
      </form.AppForm>
    </form>
  )
}
```

## DevTools

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

function RootComponent() {
  return (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}
```
