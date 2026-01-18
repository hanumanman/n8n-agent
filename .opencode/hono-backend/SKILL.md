---
name: hono-backend
description: Backend API development with Hono framework for the vite-hono monorepo. Use when creating API endpoints, implementing middleware, handling errors, setting up validation, database integration, authentication, or any backend-related tasks in the packages/be directory.
compability: opencode
---

# Hono Backend

Use this skill for all backend development in `packages/be/` using Hono framework.

## Project Structure

```
src/
├── index.ts              # Entry point
├── app/
│   ├── app.ts            # Hono app
│   ├── middleware/       # Middleware
│   └── routes/           # Route modules
├── services/             # Business logic
├── repositories/         # Data access
├── types/                # Type definitions
└── validators/           # Zod schemas
```

## Routes

```ts
import { Hono } from "hono"

const app = new Hono()

app.get("/api/todos", c => c.json({ todos: [] }))
app.get("/api/todos/:id", c => c.json({ id: c.req.param("id") }))
app.post("/api/todos", async c => {
  const body = await c.req.json()
  return c.json({ created: body }, 201)
})
```

### Route Modules

```ts
const todosRouter = new Hono()
  .get("/", c => c.json({ todos: [] }))
  .post("/", c => c.json({ created: true }))
  .get("/:id", c => c.json({ id: c.req.param("id") }))
  .put("/:id", c => c.json({ updated: true }))
  .delete("/:id", c => c.json({ deleted: true }))

app.route("/api/todos", todosRouter)
```

## Request Handling

```ts
// Query params
const q = c.req.query("q")
const tags = c.req.queries("tags")

// JSON body
const body = await c.req.json()

// Form data
const form = await c.req.parseBody()

// Headers
const auth = c.req.header("Authorization")
c.header("X-Custom", "value")
```

## Validation with Zod

```ts
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const todoSchema = z.object({
  title: z.string().min(1),
  completed: z.boolean().optional()
})

app.post("/api/todos", zValidator("json", todoSchema), c => {
  const todo = c.req.valid("json")
  return c.json({ todo }, 201)
})

app.get(
  "/api/search",
  zValidator(
    "query",
    z.object({
      q: z.string(),
      page: z.coerce.number().optional()
    })
  ),
  c => {
    const { q, page } = c.req.valid("query")
    return c.json({ q, page })
  }
)

app.get(
  "/api/todos/:id",
  zValidator("param", z.object({ id: z.uuid() })),
  c => {
    const { id } = c.req.valid("param")
    return c.json({ id })
  }
)
```

### Custom Validation Errors

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

## Error Handling

```ts
import { HTTPException } from "hono/http-exception"

app.get("/api/users/:id", async c => {
  const user = await findUser(c.req.param("id"))
  if (!user) throw new HTTPException(404, { message: "User not found" })
  return c.json({ user })
})

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message, status: err.status }, err.status)
  }
  console.error(err)
  return c.json({ error: "Internal Server Error" }, 500)
})

app.notFound(c => c.json({ error: "Not Found", path: c.req.path }, 404))
```

## Middleware

```ts
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { bearerAuth } from "hono/bearer-auth"

app.use("*", logger())
app.use("*", cors({ origin: "http://localhost:3000", credentials: true }))
app.use("/api/*", bearerAuth({ token: process.env.API_TOKEN! }))

// Custom middleware
app.use("*", async (c, next) => {
  console.log("Request:", c.req.method, c.req.url)
  await next()
})
```

## Type Safety

```ts
type Env = {
  Bindings: { DB: Database }
  Variables: { userId: string }
}

const app = new Hono<Env>()

app.use("/api/*", async (c, next) => {
  c.set("userId", "user-123")
  await next()
})

app.get("/api/profile", c => {
  const userId = c.get("userId")
  return c.json({ userId })
})
```

## Responses

```ts
c.json({ data }, 201)
c.text("Hello World")
c.html("<h1>Hello</h1>")
c.redirect("/new-location")

// Stream
app.get("/stream", c =>
  c.streamText(async stream => {
    for (let i = 0; i < 10; i++) {
      await stream.write(`data: ${i}\n`)
      await stream.sleep(100)
    }
  })
)

// Binary/File
app.get("/download/:filename", async c => {
  const file = await readFile(`./files/${c.req.param("filename")}`)
  c.header("Content-Type", "application/octet-stream")
  c.header(
    "Content-Disposition",
    `attachment; filename="${c.req.param("filename")}"`
  )
  return c.body(file)
})
```

## Hono RPC

```ts
// routes/todos.ts
const app = new Hono()
  .get("/", async c => c.json(await getTodos()))
  .post("/", zValidator("json", todoSchema), async c =>
    c.json(await createTodo(c.req.valid("json")), 201)
  )
  .get("/:id", async c => c.json(await getTodo(c.req.param("id"))))

export type TodosRoute = typeof app
export default app

// client.ts
import { hc } from "hono/client"
import type { TodosRoute } from "./routes/todos"

const client = hc<TodosRoute>("http://localhost:3333/api/todos")
const todos = await client.index.$get()
const newTodo = await client.index.$post({ json: { title: "New Todo" } })
```

## Database

```ts
// Drizzle
import { drizzle } from "drizzle-orm/bun-sqlite"
import Database from "bun:sqlite"

const db = drizzle(new Database("db.sqlite"))

app.get("/api/todos", async c => {
  const todos = await db.select().from(todosTable)
  return c.json(todos)
})

// Prisma
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

app.get("/api/todos", async c => c.json(await prisma.todo.findMany()))
```

## Development

```ts
export default { fetch: app.fetch, port: 3333 }
```

Run: `bun run --hot src/index.ts`
