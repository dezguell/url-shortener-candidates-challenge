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
7. **Robustness** — closed the two gaps a reviewer would hit first: unvalidated input and silent code collisions. Also fixed Docker, which didn't actually run.
8. **Polish** — loading states on the form, plus a theming bug that was silently breaking every themed color in the app

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
- The root `ErrorBoundary` in `root.tsx` is a safety net for unexpected server errors and unhandled exceptions. It used to duplicate `ErrorPage`'s layout logic inline; it now just renders `ErrorPage` with a 500 status, so there's one place that owns error styling instead of two.

### Architecture
The original code had no separation of concerns — all logic lived in two route files with a module-level Map as storage. The refactor introduced clear layers:

**Domain layer (`libs/engine`)** — pure TypeScript, zero runtime dependencies. Owns the `UrlRepository` interface, the `ShortenedUrl` type, and `generateShortCode()`. Nothing here knows about React, Prisma, or HTTP.

**Infrastructure layer (`applications/web/app/repositories`)** — `PrismaUrlRepository` implements `UrlRepository` using Prisma. Keeps database concerns out of the domain and out of the route files.

**Route layer (`applications/web/app/routes`)** — thin HTTP handlers. `loader` fetches data, `action` writes data, both delegate immediately to the repository. No business logic lives here.

**Component layer (`applications/web/app/components`)** — reusable UI pieces (`ShortenForm`, `ShortenResult`, `UrlList`, `ErrorPage`) that receive only the props they need. No framework knowledge, no data fetching.

**Removed dead code** — the original `shortenedUrls` Map export was still present in `libs/engine` after the persistence refactor. It was the root cause of the original bug and was deleted once confirmed unused.

**Folder structure** — as the engine grew past a handful of files, `libs/engine/src` was reorganized into `services/` (pure logic: code generation, validation, retry helper), `repositories/` (the `UrlRepository` interface), and `tests/` (mirrors the other two, so it's obvious what's covered and what isn't).

### Design
The original UI was intentionally broken — mismatched colors (lime/pink/cyan gradient), dashed purple borders, skewed buttons, and wavy decorations. The redesign replaced it with a clean, minimal interface.

**Component library** — added [shadcn/ui](https://ui.shadcn.com/) primitives (manually, since the CLI is interactive). Components live in `app/components/ui/`: `Button`, `Input`, `Card`, `Badge`. Supporting utilities: `app/lib/utils.ts` exports the `cn()` helper (clsx + tailwind-merge).

**Theme** — CSS custom properties defined in `app.css` following the shadcn convention (`--background`, `--foreground`, `--primary`, `--border`, etc.). Tailwind v4 `@theme` block maps these into utility classes.

**Layout** — the index page is a centered single-column layout on a white background. The form, result card, and URL list stack vertically as separate `Card` components with consistent spacing and border treatment.

**Result feedback** — the shortened URL result card uses a green success style (icon + monospace link) that visually distinguishes it from the input form without jarring color shifts.

### Robustness
Two things stood out as missing once the happy path worked: nothing stopped a bad URL from being saved, and nothing stopped two different URLs from landing on the same short code.

- **URL validation** — `validateUrl()` rejects empty input, unparseable strings, and anything that isn't `http`/`https` (so `javascript:...` can't be shortened). It runs in the action, backing up the browser's native `type="url"` check for anyone bypassing the client (curl, disabled JS).
- **Collision handling** — `generateShortCode()` never checked anything before; two different URLs could land on the same code and the second write would crash with an unhandled DB error. `saveWithUniqueCode(url, generateCode)` now catches that specific unique-constraint violation and retries with a fresh code, using a small generic `withRetries()` helper (unit-tested on its own, no DB needed). Verified against a real SQLite database by forcing a collision on purpose.
- **Docker fix** — `docker-compose up --build` was actually broken: `node:20-alpine` has no OpenSSL, so Prisma's schema engine couldn't start and `prisma migrate deploy` failed on every boot. Added `apk add openssl` to the Dockerfile. Confirmed the full flow — build, migrate, shorten, redirect — works in the actual container, not just in dev.

### Polish
- **Loading states** — the form uses React Router's `useNavigation()` to know when a submission is in flight, and disables itself with a spinner during that window. The spinner/disable logic lives inside the reusable `Button` component (`loading` / `loadingText` props) rather than being copy-pasted into every form that needs it.
- **Theming bug** — every themed color in the app (`bg-[--primary]`, `text-[--foreground]`, etc.) was silently not rendering. Tailwind v4 compiled that bracket syntax to `background-color: --primary` — invalid CSS the browser just drops — instead of wrapping it in `var()`. Since `app.css` already declares these as `@theme` tokens, the fix was to use Tailwind's native utilities directly (`bg-primary`, `text-foreground`, ...), which is what the theme system is for. This was pre-existing, not something introduced during this pass — worth knowing about since it affected essentially every component.

## What I Would Do With More Time

<!-- What would you tackle next if you had more time? -->
- **Click statistics** — track a `clicks` counter per short URL and surface it in the listing view. This is the one named requirement I didn't get to.
- **Abuse prevention** — basic rate limiting on the shorten action; right now nothing stops someone from hammering it.
- **Broader test coverage** — one route now has coverage (see "Post-feedback update" below), but `PrismaUrlRepository` and the components still don't.
- **Storybook** — isolate and document UI components for independent development and visual testing.

## Post-feedback update

<!-- Kabilio's review flagged that the persistence layer lived inside the web app and that routes instantiated PrismaUrlRepository directly, so the UrlRepository interface wasn't actually enforcing a dependency boundary. This addresses that. -->
Kabilio's engineering review (2026-07-08) flagged one thing above everything else: the persistence layer (Prisma + the repository) lived inside `applications/web` instead of an isolated infrastructure package, and routes called `new PrismaUrlRepository()` directly — so the `UrlRepository` interface existed but nothing enforced it, and swapping the implementation (for tests or otherwise) meant touching every route. Fixed both:

- **New `libs/infrastructure` package** (`@url-shortener/infrastructure`) — owns the Prisma schema, migrations, client singleton, and `PrismaUrlRepository`. It depends on `libs/engine` (to implement `UrlRepository`); nothing depends on it except the composition root below. Dependency direction is now domain ← infrastructure ← delivery, not delivery → infrastructure.
- **Composition root via React Router's context/middleware** (`applications/web/app/server/url-repository.server.ts`, future flag `v8_middleware` in `react-router.config.ts`) — this is the *only* file in the web app that imports `@url-shortener/infrastructure` or instantiates `PrismaUrlRepository`. A root-level middleware puts it into request context; `loader`/`action` in both routes now read it via `context.get(urlRepositoryContext)` and are typed against `UrlRepository` only.
- **Proof it's substitutable** — `applications/web/app/routes/_index.test.ts` swaps in a fake in-memory `UrlRepository` via the same context mechanism, with no Prisma/DB involved, exactly the scenario the review said wasn't possible.

Dockerfile and docker-compose were updated to build/migrate against the new package location; `pnpm build`, `pnpm typecheck`, `pnpm test`, and a manual end-to-end run (shorten → list → redirect) all pass after the move.

## AI Usage

<!-- How did you use AI tools (if any)? Include some example prompts if you used any agent. -->
Used Claude Code throughout. Key use cases:

- **Codebase orientation** — asked for an architectural overview and a list of known issues to produce the initial `CLAUDE.md`.
- **Dependency setup** — guided Prisma v5 installation (v7 had an ESM incompatibility), migration configuration, and Docker named-volume wiring.
- **Best-practice confirmation** — verified React Router v7 conventions (loader/action placement, splat routes, ErrorBoundary), Prisma singleton HMR guard patterns, and shadcn/ui manual setup for Tailwind v4.
- **Code generation** — generated infrastructure boilerplate (repository interface, Prisma implementation, db singleton, migrations). Business logic and architectural decisions were made by me first, then implemented with Claude's assistance.

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
The challenge is well-scoped: each bug has a distinct root cause and the fixes compose naturally into a production-quality app. The intentional chaos in the UI is a nice touch — it forces a design decision rather than just a cleanup.
