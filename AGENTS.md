<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `npx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

This document contains general guidelines, architecture overview, commands, and code conventions for the Expenseflow project. You must adhere to these rules when contributing to this codebase.

## 🏗 Architecture Overview

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + PostCSS
- **UI Components**: React 19

## 🚀 Commands

- **Development Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Start Production Server**: `npm run start`
- **Lint Code**: `npm run lint`

## 💻 Code Conventions

### Naming Conventions
- **Directories**: Use lowercase with hyphens (e.g., `components/ui`, `app/dashboard-view`).
- **Files**: Use `kebab-case` for all files, including React components (e.g., `my-button.tsx`) and utilities (e.g., `format-date.ts`).
- **Variables & Functions**: Use `camelCase`.
- **Constants**: Use `UPPER_SNAKE_CASE` for global constants.
- **Types/Interfaces**: Use `PascalCase` and avoid prefixing with `I` or `T` (e.g., `User` instead of `IUser`).

### React & Next.js Best Practices
- **Server vs Client Components**: Default to Server Components. Add `"use client"` only when necessary (e.g., for interactivity, state, or DOM event listeners).
- **Function Definitions**: Use standard function declarations for components (e.g., `export default function MyComponent() { ... }`) to leverage better debugging and component naming. Use arrow functions for callbacks.
- **Data Fetching**: Use **React Query** (`useQuery`, `useMutation`) for all client-side API requests. Use Next.js native `fetch` with caching/revalidation for Server Components, and server actions for server-side mutations.

### Error Handling
- Use `try/catch` blocks for asynchronous operations.
- Create designated `error.tsx` files in route segments for graceful UI degradation on errors.
- Do not silently swallow errors; log them appropriately and return user-friendly error states or toast notifications.

### TypeScript
- Enable and maintain `strict` mode.
- Avoid using `any`; define precise types or use `unknown` if the shape is truly dynamic.
- Prefer `interface` over `type` for object shapes unless union/intersection features are specifically needed.

## 🛑 Operational Boundaries
- **Run Tests First**: Always execute relevant tests to verify current state before making changes, and after implementing new features or fixes.
- **Reuse Utility Functions**: Search the codebase for existing utilities before reinventing or duplicating logic.
- **High-Stake Operations**: ALWAYS ask for explicit user permission before executing high-stake operations, including:
  - Database schema changes
  - Installing new dependencies
  - Deleting files or significant blocks of code
- **Environment Variables**: Never touch or edit `.env` or `.env.local` files directly. When referencing environment variables in code, write `process.env.KEY_NAME` directly in the code and add `KEY_NAME=` to `.env.example`. The developer is responsible for assigning the actual values in their local environment files.
- **Concise Communication**: When providing explanations or comments after completing an implementation, keep them simplified and as short as possible.


