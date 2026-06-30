# Submission

## What I Did

<!-- Briefly describe what you implemented or improved. What did you prioritize and why? -->
### Used Claude Code to review the code and give me an overview of the architecture
    - I need to have a memory of the code and its problems sated in the claude.md
### Priorities the issues:
- Functionality
- Persistence
- Persistence feedback
- Error handel
- Performance 
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

## What I Would Do With More Time

<!-- What would you tackle next if you had more time? -->
- Dependency Injection management

## AI Usage
- Main use was to understand the code, and generate any infrastructure needed (all database infra)
<!-- How did you use AI tools (if any)? Include some example prompts if you used any agent. -->

## Feedback

<!-- Any feedback on the challenge? Was it clear? Too easy/hard? Suggestions? -->
