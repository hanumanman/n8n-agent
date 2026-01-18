---
name: monorepo-workspaces
description: Working with Bun workspaces in the vite-hono monorepo. Use when managing cross-package dependencies, using path aliases, coordinating development scripts, shared configurations, or workspace management across packages/fe and packages/be.
compability: opencode
---

# Monorepo Workspaces

Use this skill for working with Bun workspaces in the vite-hono monorepo.

## Project Structure

```
vite-hono/
├── packages/
│   ├── fe/              # Frontend (Vite + React + TanStack)
│   └── be/              # Backend (Hono + Bun)
├── package.json         # Root workspace configuration
└── bun.lock             # Workspace lockfile
```

## Workspace Configuration

### Root package.json

```json
{
  "name": "vite-hono-monorepo",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "bun --filter '*' dev",
    "lint": "bun --filter '*' lint --fix",
    "format": "prettier --write ."
  }
}
```

### Running Scripts Across Workspaces

```bash
# Run dev script in all packages
bun dev

# Run specific script in all packages
bun --filter '*' build

# Run script in specific package
bun --filter fe dev
bun --filter be dev

# Run script in package with pattern
bun --filter '*-fe' dev
```

## Path Aliases

### Frontend tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@backend/*": ["../be/src/*"]
    }
  }
}
```

### Vite Configuration (vite.config.ts)

```ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@backend": path.resolve(__dirname, "../be/src")
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true
      }
    }
  }
})
```

### Using Aliases in Code

```tsx
// Import from same package
import { useAppForm } from "@/hooks/demo.form"
import { cn } from "@/lib/utils"

// Import from backend package
import type { Todo } from "@backend/types"
```

## Shared Dependencies

### Dependency Management

Dependencies declared in root `package.json` affect all workspaces:

```json
{
  "devDependencies": {
    "prettier": "^3.8.0",
    "prettier-plugin-tailwindcss": "^0.7.2"
  }
}
```

### Package-Specific Dependencies

Each workspace has its own `package.json`:

```json
// packages/fe/package.json
{
  "name": "fe",
  "dependencies": {
    "@tanstack/react-query": "^5.66.5"
  }
}

// packages/be/package.json
{
  "name": "be",
  "dependencies": {
    "hono": "^4.11.4"
  }
}
```

## Cross-Package Imports

### TypeScript Configuration

Ensure `paths` alias points to correct location:

```ts
// In frontend, import backend types
import type { Todo, CreateTodoDTO } from "@backend/types"
```

### Backend Export Types

```ts
// packages/be/src/types/index.ts
export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

export interface CreateTodoDTO {
  title: string
}
```

## Development Workflow

### Start All Services

```bash
# Starts both frontend (port 3000) and backend (port 3333)
bun dev
```

### Start Specific Service

```bash
# Frontend only
cd packages/fe
bun dev

# Backend only
cd packages/be
bun dev
```

### Build All Packages

```bash
bun --filter '*' build
```

### Lint and Format

```bash
# Lint all packages with auto-fix
bun run lint

# Format all files
bun run format
```

## Environment Variables

### Frontend Environment Variables

```ts
// packages/fe/src/env.ts
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: { SERVER_URL: z.string().url().optional() },
  clientPrefix: "VITE_",
  client: { VITE_APP_TITLE: z.string().min(1).optional() },
  runtimeEnv: import.meta.env
})
```

### Backend Environment Variables

```ts
// packages/be/src/config/env.ts
const env = {
  port: process.env.PORT || 3333,
  databaseUrl: process.env.DATABASE_URL
}
```

### Shared .env File

```bash
# .env
PORT=3333
DATABASE_URL=sqlite://./db.sqlite

VITE_APP_TITLE=My App
```

## Package Scripts

### Root Scripts

```json
{
  "scripts": {
    "dev": "bun --filter '*' dev",
    "build": "bun --filter '*' build",
    "lint": "bun --filter '*' lint --fix",
    "format": "prettier --write .",
    "test": "bun --filter '*' test"
  }
}
```

### Frontend Scripts

```json
{
  "scripts": {
    "dev": "vite --port 3000",
    "build": "vite build && tsc",
    "test": "vitest run",
    "lint": "eslint",
    "format": "prettier",
    "check": "prettier --write . && eslint --fix"
  }
}
```

### Backend Scripts

```json
{
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "lint": "eslint ."
  }
}
```

## Shared Code Patterns

### Utility Functions

```ts
// packages/shared/src/utils.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}

export function generateId(): string {
  return crypto.randomUUID()
}
```

### Shared Types

```ts
// packages/shared/src/types.ts
export interface User {
  id: string
  email: string
}

export interface Todo {
  id: string
  title: string
}
```

### Importing Shared Code

```ts
// In frontend
import { formatDate } from "@/shared/utils"

// In backend
import { formatDate } from "@shared/utils"
```

## Testing Across Workspaces

### Run All Tests

```bash
bun --filter '*' test
```

### Run Tests in Specific Package

```bash
cd packages/fe
bun test
```

### Shared Test Utilities

```ts
// packages/shared/src/test-utils.ts
export function mockApi<Response>(response: Response) {
  return vi.fn().mockResolvedValue(response)
}

export function createMockTodo(overrides = {}) {
  return {
    id: "1",
    title: "Test Todo",
    completed: false,
    ...overrides
  }
}
```

## CI/CD Considerations

### Build Order

When building for deployment, ensure backend builds first if frontend depends on it:

```bash
bun --filter be build
bun --filter fe build
```

### Shared Scripts

```bash
#!/bin/bash
# scripts/build-all.sh

echo "Building backend..."
bun --filter be build

echo "Building frontend..."
bun --filter fe build

echo "All packages built successfully!"
```

## Version Management

### Package Versioning

When updating versions, update both the specific package and any dependents:

```bash
# Update backend version
cd packages/be
bun update hono

# Update frontend version
cd packages/fe
bun update @tanstack/react-query
```

### Lockfile Management

The root `bun.lock` manages all workspace dependencies:

```bash
# Update all dependencies
bun update

# Update specific dependency across workspaces
bun update hono
```

For advanced workspace patterns, see [references/advanced-workspaces.md](references/advanced-workspaces.md)
