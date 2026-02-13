# Agent Guidelines

This is a Bun + React + TypeScript project using Tailwind CSS v4 and shadcn/ui components.

## Commands

```bash
# Development
bun --hot src/index.ts          # Start dev server with HMR
bun run dev                     # Same as above (npm script)

# Production
bun src/index.ts                # Run in production mode
NODE_ENV=production bun src/index.ts
bun run start                   # Same as above (npm script)

# Build
bun run build.ts                # Build for production
bun run build                   # Same as above
bun run build.ts --outdir=dist --minify --sourcemap=linked

# Testing
bun test                        # Run all tests
bun test <pattern>              # Run tests matching pattern
bun test --watch                # Run tests in watch mode
bun test --coverage             # Run tests with coverage

# Linting / Type Checking
bun tsc --noEmit               # Type check without emitting
```

## Project Structure

```
/src
  /components       # React components (shadcn/ui compatible)
  /lib             # Utility functions (cn() in lib/utils.ts)
  index.ts         # Bun server entry point
  index.html       # HTML entry for frontend
/components.json   # shadcn/ui configuration
```

## Code Style

### TypeScript

- **Strict mode enabled**: All strict compiler options are on
- **Target**: ESNext with DOM lib
- **Module**: Preserve with bundler resolution
- **JSX**: react-jsx transform
- Use explicit `type` imports: `import { type Foo } from "..."`
- Prefer `interface` over `type` for object shapes
- Use `noUncheckedIndexedAccess`: handle potentially undefined index access

### Imports & Paths

- Path alias `@/*` maps to `./src/*`
- Use `@/components` for components
- Use `@/lib/utils` for utility functions
- Import order: React → External libs → Internal (@/*) → Relative

### Formatting

- Double quotes for strings
- Semicolons at end of statements
- 2-space indentation
- 80-100 character line length (use judgment)

### Naming Conventions

- Components: PascalCase (e.g., `Button.tsx`)
- Hooks: camelCase starting with `use` (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `utils.ts`)
- Types/Interfaces: PascalCase with descriptive names
- Constants: UPPER_SNAKE_CASE for true constants

### React Patterns

- Use functional components with explicit return types when helpful
- Destructure props in component parameters
- Use React 19 features (no need for forwardRef in most cases)
- Prefer `use` hook for promises/context when available

### Styling (Tailwind v4)

- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow shadcn/ui patterns for component styling
- CSS variables for theming (see globals.css)
- Tailwind v4: No tailwind.config file needed

### Error Handling

- Use explicit error types when possible
- Handle async errors with try/catch
- Log errors with context before re-throwing if needed
- Use `noFallthroughCasesInSwitch` - handle all switch cases

### Bun APIs

- Use `Bun.serve()` for server (built-in WebSocket support)
- Use `bun:sqlite` for SQLite (not better-sqlite3)
- Use `Bun.file()` instead of node:fs readFile/writeFile
- Use `Bun.$` for shell commands instead of execa

### Frontend (Bun HTML Imports)

- HTML files import .tsx/.jsx files directly
- Bun bundles and transpiles automatically
- CSS imports work directly in TSX: `import './index.css'`

## Key Dependencies

- React 19 (latest)
- Tailwind CSS v4
- shadcn/ui components
- @huggingface/transformers
- Radix UI primitives
- Lucide React icons

## Testing

Use Bun's built-in test runner:

```typescript
import { test, expect } from "bun:test";

test("description", () => {
  expect(actual).toBe(expected);
});
```

Run single test: `bun test path/to/file.test.ts`
