# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React Router v7 SSR app
└── libs/engine/         # Domain logic (pure TypeScript)
```

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first CSS framework for rapid UI development                                              |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |
| [Prisma](https://www.prisma.io/)              | Type-safe ORM. Manages the SQLite schema, migrations, and query client                            |
| [SQLite](https://www.sqlite.org/)             | Embedded SQL database. Stored as a file; mounted as a Docker volume in production                 |
| [shadcn/ui](https://ui.shadcn.com/)           | Accessible UI primitives (Button, Input, Card, Badge) built on Radix UI                           |
| [Vitest](https://vitest.dev/)                 | Unit test runner used for the engine domain logic                                                 |

## Local Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

The root `.env` is read by Vite at runtime. `PUBLIC_URL` is the only required variable — set it to the base URL of the app:

```
PUBLIC_URL=http://localhost:5173   # dev
PUBLIC_URL=http://localhost:3000   # docker
```

### 3. Set up the database

Prisma reads its own `DATABASE_URL` from `applications/web/.env`. Create it if it does not exist:

```bash
echo 'DATABASE_URL="file:./dev.db"' > applications/web/.env
```

Then run the initial migration:

```bash
cd applications/web && pnpm db:migrate
```

This creates `applications/web/prisma/dev.db` and applies all pending migrations.

### 4. Start the dev server

```bash
pnpm dev
```

Open `http://localhost:5173`

## Database Commands

Run from `applications/web/`:

| Command                    | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| `pnpm db:migrate`          | Create and apply a new migration (dev only)              |
| `pnpm db:migrate:deploy`   | Apply pending migrations without creating new ones (prod)|
| `pnpm db:generate`         | Regenerate the Prisma client after schema changes        |
| `pnpm prisma migrate reset --force` | Drop all data and re-run migrations from scratch  |

## Running Tests

```bash
pnpm test          # run all tests across the monorepo
```

Or scoped to the engine package:

```bash
pnpm --filter @url-shortener/engine test
```

## Docker Setup

```bash
docker-compose up --build
```

Open `http://localhost:3000`

The SQLite database is stored in a named Docker volume (`db-data`) so data persists across container restarts. Migrations run automatically on container startup.
