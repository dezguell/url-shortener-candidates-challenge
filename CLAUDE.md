# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a **candidates challenge** repository. The starting codebase is intentionally flawed. The goal is to refactor and improve it into a production-quality URL shortener. See [CHALLENGE_DESCRIPTION.md](./CHALLENGE_DESCRIPTION.md) for full requirements and [CHALLENGE_SUBMISSION.md](./CHALLENGE_SUBMISSION.md) for documenting work done.

## Commands

Run all commands from the monorepo root unless noted otherwise.

```bash
pnpm install           # install dependencies
pnpm dev               # start all packages in dev mode (Turbo parallel)
pnpm build             # build all packages
pnpm typecheck         # typecheck all packages
pnpm clean             # remove build artifacts and Turbo cache
pnpm clean:deep        # also removes all node_modules
```

```bash
docker-compose up --build   # build and run production container on :3000
```

There are no tests yet — adding them is part of the challenge.

## Architecture

Pnpm workspaces + Turbo monorepo:

```
applications/web/   → React Router v7 SSR app (Vite, Tailwind CSS)
libs/engine/        → domain logic shared library (pure TypeScript, no framework)
```

### Data flow

React Router v7 handles both client and server in one model. Every route file in `applications/web/app/routes/` can export a `loader` (GET, server-side) and an `action` (POST/mutation, server-side). Components run on both server and client.

Routes are explicitly registered in [applications/web/app/routes.ts](applications/web/app/routes.ts) (not auto-discovered from the filesystem, even though file names follow the `$param` convention).

The two routes:
- `_index.tsx` — form to shorten a URL (`loader` serves base URL, `action` creates short code)
- `s.$code.tsx` — redirect route; `loader` looks up `params.code` and redirects

### Engine library

`libs/engine` is consumed by the web app as a workspace package (`@url-shortener/engine`). The web app's `vite.config.ts` bundles it into the server via `ssr.noExternal`. The engine points its `exports` and `main` to `src/index.ts` directly (no build step needed at runtime).

### Environment

`PUBLIC_URL` is the only env var. It is read in `libs/engine/src/base-url.ts` and used to construct the displayed shortened URL. The web app's `vite.config.ts` sets `envDir: "../.."` so Vite loads the root `.env`.

Copy `.env.example` to `.env` before first run. Use port `5173` for dev, `3000` for Docker.

## Known Issues (intentional starting bugs)

These are the bugs introduced by design for the challenge:

| Location | Issue |
|---|---|
| `libs/engine/src/shortened-url.ts` | `shortenedUrls` is a module-level `Map` — in-memory only, resets on restart and on Vite HMR in dev |
| `libs/engine/src/shortened-url.ts` | `generateShortCode()` uses `chars = "abc"` with `length = 2` — only 9 possible codes, collisions silently overwrite existing URLs |
| `applications/web/app/routes/_index.tsx` | No URL validation — any string is accepted and stored |
| `applications/web/app/routes/_index.tsx` | No loading state, no meaningful error feedback to the user |
| Entire codebase | No click-tracking statistics |
| Entire codebase | No tests |
| `applications/web/app/routes/_index.tsx` | UI is intentionally chaotic (mismatched colors, random transforms) |

## Challenge requirements summary

- Persistent storage (SQL or NoSQL; Prisma ORM encouraged)
- Repository pattern or similar abstraction in `libs/engine`
- Unique short code generation with collision handling
- Input validation with error feedback and loading states
- Click statistics with a listing view
- Abuse prevention / security measures
- Reusable UI components (Radix or shadcn encouraged)
- Docker must keep working after all changes
