---
description: Guidelines for creating or modifying APIs, including route handlers, API client methods, and service layers.
globs:
  - "lib/api/**/*.ts"
  - "lib/api/**/*.tsx"
  - "app/api/**/*.ts"
  - "services/**/*.ts"
  - "lib/services/**/*.ts"
alwaysApply: false
---

# 🔌 API Development Skill

When creating or modifying APIs, strictly adhere to the following guidelines:

## Client-Side Architecture
- **Domain-Based API Classes**: All API client methods must be encapsulated in domain-based classes or modules located in `lib/api/` (e.g., `lib/api/users.ts`, `lib/api/expense.ts`).

## Server-Side Architecture
- **Separation of Concerns (SOC)**: Route handlers (e.g., `app/api/.../route.ts`) and business logic services must be strictly separated. Do NOT dump business logic inside route handlers.
- **Service Layer**: Keep business logic, complex validation, and database interactions within a dedicated service layer (e.g., `lib/services/` or `services/`). Route handlers should only parse the request, call the appropriate service, and return the response.

## Design Principles & Practices
- **SOLID & DRY**: Adhere to SOLID principles and keep your code DRY (Don't Repeat Yourself). Extract reusable logic into shared utilities or base service classes.
- **Test-Driven Execution**: Always run existing tests before refactoring, and write/run new tests for any newly implemented API logic.
- **Code Documentation**: Properly document your code. Use TSDoc/JSDoc for classes, methods, and complex business logic. Clearly explain the *why* and *how* behind non-obvious logic, not just the *what*.
- **API Documentation**: Ensure that external API documentation (e.g., README, Swagger/OpenAPI) is updated immediately when endpoints or request/response payloads are modified.
