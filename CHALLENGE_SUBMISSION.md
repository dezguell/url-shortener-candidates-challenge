# Submission

## What I Did

<!-- Briefly describe what you implemented or improved. What did you prioritize and why? -->
I worked through the codebase systematically, prioritizing issues by impact:

1. **Functionality** — fixed the broken short code generator (wrong alphabet, too short, silent collisions)
2. **Persistence** — replaced the ephemeral in-memory Map with Prisma + SQLite
3. **Persistence Feedback** — added a URL listing view so users can see stored links
4. **Error Handling** — built a proper 404 flow with a reusable error component and catch-all route
5. **Architecture** — separated concerns into domain, infrastructure, route, and component layers
6. **Design** — replaced the intentionally chaotic UI with a clean shadcn/ui-bsaed interface

### Functionality
- Added unit tests for `generateShortCode()` before refactoring (length, character set, uniqueness rate).
- Fixed the generator: was using `chars = "abc"` with `length = 2` (9 possible codes); replaced with 62-character alphanumeric alphabet and length 7 (~3.5 trillion combinations).
- Confirmed the app routes correctly end-to-end after the change.

### Persistence
- The original implementation used a module-level `Map<string, string>` in `libs/engine` as storage. This reset on every server restart and on every Vite HMR reload in development, making shortened URLs effectively single-session only.
- Replaced it with **Prisma + SQLite** using a repository pattern. The `UrlRepository` interface lives in `libs/engine` (domain layer, zero dependencies), and the `PrismaUrlRepository` implementation lives in `applications/web` (infrastructure layer).
- Added a Prisma client singleton in `db.server.ts` with an HMR guard (`globalThis.__prisma`) to prevent connection exhaustion during development reloads.
- In Docker, the SQLite file is stored at `/app/data/db.sqlite` and mounted as a named volume (`db-data`), so URLs survive container restarts. Migrations run automatically at container startup via `prisma migrate deploy`.

### Persistence Feedback
- Added a `findAll()` method to the `UrlRepository` interface and its Prisma implementation, returning all stored URLs ordered by creation date (newest first).
- The home page loader calls `findAll()` on every request and passes the result to the component.
- A "Recent links" panel renders below the form, listing each short code as a clickable link alongside the original URL and timestamp. The panel is hidden when no URLs exist yet.
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

### Design
The original UI was intentionally broken — mismatched colors (lime/pink/cyan gradient), dashed purple borders, skewed buttons, and wavy decorations. The redesign replaced it with a clean, minimal interface.

**Component library** — added [shadcn/ui](https://ui.shadcn.com/) primitives (manually, since the CLI is interactive). Components live in `app/components/ui/`: `Button`, `Input`, `Card`, `Badge`. Supporting utilities: `app/lib/utils.ts` exports the `cn()` helper (clsx + tailwind-merge).

**Theme** — CSS custom properties defined in `app.css` following the shadcn convention (`--background`, `--foreground`, `--primary`, `--border`, etc.). Tailwind v4 `@theme` block maps these into utility classes.

**Layout** — the index page is a centered single-column layout on a white background. The form, result card, and URL list stack vertically as separate `Card` components with consistent spacing and border treatment.

**Result feedback** — the shortened URL result card uses a green success style (icon + monospace link) that visually distinguishes it from the input form without jarring color shifts.

## What I Would Do With More Time

<!-- What would you tackle next if you had more time? -->
- **URL validation** — reject non-URL strings at the action level with a helpful inline error message.
- **Collision handling** — retry `generateShortCode()` if the generated code already exists in the database (currently a unique constraint violation would surface as a 500).
- **Click statistics** — track a `clicks` counter per short URL and surface it in the listing view.
- **Dependency injection** — pass the repository through context rather than instantiating `PrismaUrlRepository` directly in each route.
- **Storybook** — isolate and document UI components for independent development and visual testing.

## AI Usage

<!-- How did you use AI tools (if any)? Include some example prompts if you used any agent. -->
Used Claude Code throughout. Key use cases:

- **Codebase orientation** — asked for an architectural overview and a list of known issues to produce the initial `CLAUDE.md`.
- **Dependency setup** — guided Prisma v5 installation (v7 had an ESM incompatibility), migration configuration, and Docker named-volume wiring.
- **Best-practice confirmation** — verified React Router v7 conventions (loader/action placement, splat routes, ErrorBoundary), Prisma singleton HMR guard patterns, and shadcn/ui manual setup for Tailwind v4.
- **Code generation** — generated infrastructure boilerplate (repository interface, Prisma implementation, db singleton, migrations). Business logic and architectural decisions were made by me first, then implemented with Claude's assistance.

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
The challenge is well-scoped: each bug has a distinct root cause and the fixes compose naturally into a production-quality app. The intentional chaos in the UI is a nice touch — it forces a design decision rather than just a cleanup. A suggested addition would be a brief rubric or scoring guide so candidates know which areas carry the most weight.
