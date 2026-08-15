# Mental Journal

Backend API for a **private mental journal**: register with email, verify account, then create and manage your own journal entries (mood, emotional tags, visibility).

This is intentionally a learning-focused NestJS backend. There is **no frontend app in this repo yet**, and no public social feed / chat / AI moderation in the current codebase.

## Stack

- **Monorepo:** pnpm + Turborepo
- **API:** NestJS 11, Prisma 7, PostgreSQL 16
- **Auth:** JWT access token + refresh session (httpOnly cookies), email verification via Resend
- **Other:** Swagger (non-production), throttling, i18n for journal tags (PL/EN)

## What’s implemented

| Area    | Endpoints (prefix `/v1`)                                                                                                                                                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth    | `POST /auth/register`, `POST /auth/login`, `GET /auth/verify-email`, `POST /auth/resend-verification`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/logout-all`, `GET /auth/me` |
| Journal | CRUD under `/journal` (authenticated, own entries only)                                                                                                                                   |
| Health  | `GET /health`                                                                                                                                                                             |

Auth details worth knowing:

- Access + refresh tokens live in **httpOnly** cookies (`secure` in `NODE_ENV=production`)
- Refresh tokens are stored hashed; rotation uses an atomic DB update
- Account must be **ACTIVE** and **email-verified** to use journal routes

## Requirements

- Node.js ≥ 18
- pnpm 9
- Docker (for Postgres)

## Setup

```sh
pnpm install
```

Copy env templates and fill values:

```sh
cp apps/api/.env.example apps/api/.env
# optional: docker/.env for Postgres user/password/port
```

Minimum for local API (`apps/api/.env`):

- `DATABASE_URL` — e.g. `postgresql://mental_journal:mental_journal@localhost:5432/mental_journal`
- `FRONTEND_URL` — used in verification links (e.g. `http://localhost:3000`)
- `JWT_ACCESS_SECRET`, `ACCESS_TOKEN_TTL`, `SESSION_REFRESH_TTL`, `EMAIL_TTL`
- `RESEND_API_KEY`, `MAIL_FROM`
- `PORT` (default `3001`), optional throttle / `FALLBACK_LANGUAGE`
- `NODE_ENV` — use `production` only in real deploy (enables secure cookies; disables Swagger)

Start Postgres and apply migrations:

```sh
pnpm docker:up
pnpm db:migrate
```

## Develop

```sh
pnpm dev
```

This starts Docker Postgres (if needed) and the API in watch mode.

- API: `http://localhost:3001/v1`
- Swagger (when not production): `http://localhost:3001/api`

## Scripts

| Command                               | Description                                  |
| ------------------------------------- | -------------------------------------------- |
| `pnpm dev`                            | Docker up + API watch                        |
| `pnpm build`                          | Build (runs tests as part of turbo pipeline) |
| `pnpm api:test`                       | Unit tests for API                           |
| `pnpm db:migrate`                     | Prisma migrate (dev)                         |
| `pnpm db:studio`                      | Prisma Studio                                |
| `pnpm docker:up` / `pnpm docker:down` | Postgres container                           |
| `pnpm lint` / `pnpm check`            | Lint / lint + format check                   |

## Project layout

```
apps/api/          NestJS API + Prisma
docker/            Postgres compose
packages/          Shared ESLint / TypeScript configs
```

## Out of scope (for now)

- Next.js (or any) client
- Public posts, comments, chat, WebSockets
- AI moderation

Those may appear later; the current MVP is **private journal + auth**.
