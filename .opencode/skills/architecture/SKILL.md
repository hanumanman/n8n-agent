---
name: architecture
description: Summarize and reference the vite-hono monorepo architecture including frontend (Vite + React + TanStack stack) and backend (Hono). Use when OpenCode needs to understand project structure, add features, or debug issues in this codebase.
compability: opencode
---

# Vite-Hono Architecture

## Project Structure

Monorepo with Bun workspaces:

- `packages/fe` - Frontend application (Vite + React + TanStack)
- `packages/be` - Backend API (Hono + Bun)

## Frontend (packages/fe)

### Tech Stack

- **Build**: Vite 7.1 with React plugin
- **Routing**: @tanstack/react-router with file-based routing
- **State**: @tanstack/react-query for server state
- **Forms**: @tanstack/react-form with Zod validation
- **Styling**: Tailwind CSS 4 with Radix UI components
- **TypeScript**: 5.7 with strict mode

### Key Patterns

- Route-based code splitting enabled
- Devtools integrated (Router, Query, React Devtools)
- Environment variables via @t3-oss/env-core
- Form handling with custom `useAppForm` hook wrapper
- Backend access via `@backend` alias to `/packages/be/src`

### Directory Structure

```
src/
├── routes/          - File-based routes
│   ├── __root.tsx   - Root layout with Header, Outlet, Devtools
│   ├── index.tsx    - Home page
│   └── demo/        - Demo pages
├── components/      - React components
│   ├── ui/          - Radix UI primitives
│   └── *.tsx        - Custom components
├── hooks/           - Custom React hooks
│   ├── demo.form.ts         - useAppForm hook
│   └── demo.form-context.ts - Form context
├── integrations/    - Third-party integrations
│   └── tanstack-query/      - QueryClient + Devtools
├── lib/             - Utility functions
└── main.tsx         - App entry point
```

## Backend (packages/be)

### Tech Stack

- **Runtime**: Bun with hot reload
- **Framework**: Hono 4.11
- **TypeScript**: 5.7

### API Structure

- Base URL: http://localhost:3333
- Example endpoints:
  - `GET /` - Hello message
  - `GET /api/todos` - Todos list (in-memory)

### Frontend Proxy

Vite dev server proxies `/api` to `http://localhost:3333`

## Development

### Scripts

```bash
# Install dependencies
bun i

# Start all services (frontend on 3000, backend on 3333)
bun dev

# Run linting and formatting across all packages
bun run lint
bun run format
```

### Package-specific scripts

```bash
# Frontend
cd packages/fe
bun dev          # Start dev server on 3000
bun build        # Build + typecheck
bun test         # Run vitest

# Backend
cd packages/be
bun dev          # Start server on 3333 with hot reload
```

## Configuration Files

### Frontend

- `vite.config.ts` - Vite config with plugins, aliases, proxy
- `tsconfig.json` - TypeScript config
- `package.json` - Dependencies and scripts

### Backend

- `src/index.ts` - Hono app entry
- `tsconfig.json` - TypeScript config
- `package.json` - Dependencies and scripts

## Common Tasks

### Add a new route

Create file in `packages/fe/src/routes/`:

```tsx
// src/routes/about.tsx
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/about")({
  component: About
})

function About() {
  return <div>About page</div>
}
```

### Add a new API endpoint

Add to `packages/be/src/index.ts`:

```ts
app.get("/api/endpoint", c => {
  return c.json({ data: "response" })
})
```

### Add a form

Create route and use `useAppForm` hook:

```tsx
import { useAppForm } from "@/hooks/demo.form"
import { z } from "zod"

const schema = z.object({ name: z.string() })

function MyForm() {
  const form = useAppForm({
    defaultValues: { name: "" },
    validators: { onBlur: schema },
    onSubmit: ({ value }) => console.log(value)
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
      <form.AppForm>
        <form.SubscribeButton label="Submit" />
      </form.AppForm>
    </form>
  )
}
```
