# Submission

## What I Did

<!-- Briefly describe what you implemented or improved. What did you prioritize and why? -->
### Used Claude Code to review the code and give me an overview of the Architecture
    - I need to have a memory of the code and its problems sated in the claude.md
### Priorities the issues:
- Functionality
- Persistence
- Persistence feedback
- Error handel
- Architecture
- Design

### Functionality
- I have added test for the shortened service in order to keep the safety need that will help to identify future errors and that proves the proper function of the method.
- Refactored the method
- Tested the app with the refactor and confirm it is working fine

### Persistence
- The original implementation used a module-level `Map<string, string>` in `libs/engine` as storage. This reset on every server restart and on every Vite HMR reload in development, making shortened URLs effectively single-session only.
- Replaced it with **Prisma + SQLite** using a repository pattern. The `UrlRepository` interface lives in `libs/engine` (domain layer, zero dependencies), and the `PrismaUrlRepository` implementation lives in `applications/web` (infrastructure layer).
- Added a Prisma client singleton in `db.server.ts` with an HMR guard (`globalThis.__prisma`) to prevent connection exhaustion during development reloads.
- In Docker, the SQLite file is stored at `/app/data/db.sqlite` and mounted as a named volume (`db-data`), so URLs survive container restarts. Migrations run automatically at container startup via `prisma migrate deploy`.

### Persistence Feedback
- Added a `findAll()` method to the `UrlRepository` interface and its Prisma implementation, returning all stored URLs ordered by creation date (newest first).
- The home page loader now calls `findAll()` on every request and passes the result to the component.
- A "Stored URLs" panel renders below the form, listing each short code as a clickable link alongside the original URL and timestamp. The panel is hidden when no URLs exist yet.
- This makes persistence immediately visible: shorten a URL, restart the dev server, and the entry reappears in the list — confirming data survived the restart.

### Error Handling
- Created a reusable `ErrorPage` component (`app/components/error-page.tsx`) that renders a consistent error UI (status code, title, description, optional dev stack trace, back-to-home link). Works both from error boundaries and from regular route components.
- Added a splat route (`route("*", "routes/not-found.tsx")`) that catches any navigation to an unregistered path and renders `ErrorPage` with a 404 state.
- The redirect route (`s.$code.tsx`) now redirects to `/not-found` when a short code is not found in the database, routing through the splat route rather than throwing into the error boundary system.
- The root `ErrorBoundary` in `root.tsx` remains as a safety net for unexpected server errors and unhandled exceptions.

### Architecture
The original code had no separation of concerns — all logic lived in two route files with a module-level Map as storage. The refactor introduced clear layers:

**Domain layer (`libs/engine`)** — pure TypeScript, zero runtime dependencies. Owns the `UrlRepository` interface, the `ShortenedUrl` type, and `generateShortCode()`. Nothing here knows about React, Prisma, or HTTP.

**Infrastructure layer (`applications/web/app/repositories`)** — `PrismaUrlRepository` implements `UrlRepository` using Prisma. Keeps database concerns out of the domain and out of the route files.

**Route layer (`applications/web/app/routes`)** — thin HTTP handlers. `loader` fetches data, `action` writes data, both delegate immediately to the repository. No business logic lives here.

**Component layer (`applications/web/app/components`)** — reusable UI pieces (`ShortenForm`, `ShortenResult`, `UrlList`, `ErrorPage`) that receive only the props they need. No framework knowledge, no data fetching.

**Removed dead code** — the original `shortenedUrls` Map export was still present in `libs/engine` after the persistence refactor. It was the root cause of the original bug and was deleted once confirmed unused.

## What I Would Do With More Time

<!-- What would you tackle next if you had more time? -->
- Dependency Injection management

## AI Usage
- Main use was to understand the code, and generate any infrastructure needed (all database infra)
<!-- How did you use AI tools (if any)? Include some example prompts if you used any agent. -->

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
