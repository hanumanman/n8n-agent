# AGENTS.md

This document provides guidelines for agentic coding agents working in this repository.

## Project Overview

This is a monorepo containing:

- **packages/fe**: React frontend with Vite, TanStack Router, TanStack Query, Tailwind CSS v4
- **packages/be**: Hono.js backend server

## Build/Lint/Test Commands

### Root Level

```bash
bun dev                    # Start all dev servers
bun lint                   # Lint all packages with auto-fix
bun format                 # Format all files
```

### Frontend (packages/fe)

```bash
vite --port 3000                    # Start dev server
vite build && tsc                   # Build and type-check
vite preview                        # Preview production build
vitest run                          # Run all tests
vitest run --reporter=verbose       # Run tests with verbose output
vitest run src/lib/utils.test.ts    # Run single test file
eslint                              # Lint frontend
eslint src/lib/utils.ts             # Lint specific file
prettier --write src/               # Format source directory
prettier --write . && eslint --fix  # Format and lint all
```

### Backend (packages/be)

```bash
bun run --hot src/index.ts # Start with hot reload
eslint .                   # Lint backend
eslint src/index.ts        # Lint specific file
```

## Code Style Guidelines

### TypeScript

- **Strict mode enabled**: `strict: true` in all tsconfig files
- **No unused code**: `noUnusedLocals: true`, `noUnusedParameters: true`
- **Explicit types**: Do not use `any`; define proper types
- **Path aliases**: Use `@/` for imports from `src/` (e.g., `@/lib/utils`)
- **Type exports**: Export types that are used externally

### React Components

- **PascalCase** for component names and files (e.g., `Button.tsx`)
- Use React 19 features (function components, hooks)
- Use `@radix-ui/react-*` primitives for accessible UI components
- Use `class-variance-authority` (CVA) for component variant props
- Use `cn()` utility for conditional Tailwind classes:
  ```typescript
  import { cn } from '@/lib/utils'
  className={cn(buttonVariants({ variant, size, className }))}
  ```
- Use `Slot` from `@radix-ui/react-slot` for polymorphic components

### Styling

- **Tailwind CSS v4** for all styling
- Use utility classes directly in components
- Use Tailwind CSS variables for theming
- Do not write custom CSS unless necessary

### Environment Variables

- Use `@t3-oss/env-core` with **Zod validation**
- Server variables defined in `server` schema
- Client variables prefixed with `VITE_` and defined in `client` schema
- Example: `packages/fe/src/env.ts`

### Backend (Hono)

- Use Hono.js for API routes
- Use `c.text()`, `c.json()` for responses
- Follow REST conventions for endpoints

### Imports

- Use **named imports** for libraries:
  ```typescript
  import { useState } from "react"
  import { Button } from "@/components/ui/button"
  ```
- Use **default import** for Hono:
  ```typescript
  import { Hono } from "hono"
  ```
- Use **absolute imports** with `@/` alias for internal modules

### Naming Conventions

- **Variables/functions**: camelCase (`const handleSubmit = ...`)
- **Components**: PascalCase (`function Button() {}`)
- **Constants**: UPPER_SNAKE_CASE for config constants
- **Files**: kebab-case for non-component files (`demo-form.ts`)
- **Component files**: PascalCase (`Button.tsx`)

### Error Handling

- Use early returns for validation errors
- Throw errors for unexpected states:
  ```typescript
  if (!user) throw new Error("User not found")
  ```
- Use Zod for runtime validation of external data

### Git Workflow

- Write clear, concise commit messages
- Keep changes focused and atomic
- Run lint/format before committing:
  ```bash
  bun lint && prettier --write .
  ```

### File Organization

- Keep components in `src/components/ui/` for primitive components
- Keep routes in `src/routes/` (TanStack Router)
- Keep utilities in `src/lib/`
- Keep integrations in `src/integrations/`
- Keep hooks in `src/hooks/`

### Testing

- Use Vitest for unit tests
- Place tests next to source files: `utils.ts` → `utils.test.ts`
- Use React Testing Library for component tests
- Mock external dependencies appropriately
