# Discord Steam Sale Notifier [![Playwright Tests](https://github.com/DominicABrooks/DiscordSaleNotifier/actions/workflows/playwright.yml/badge.svg?branch=master)](https://github.com/DominicABrooks/DiscordSaleNotifier/actions/workflows/playwright.yml)
> Full-stack Typescript application where users can input their webhooks to receive live notifications about new Steam sales.

![Untitled](https://github.com/user-attachments/assets/0999b983-8903-4971-b7d1-323c05c55599)

![License](https://img.shields.io/badge/license-MIT-green)

![Untitled](https://user-images.githubusercontent.com/51772450/209007740-594c6448-e763-4e58-b60d-cfa26d6917d8.png)

# Getting started
1. **Set up PostgreSQL:**
- Create a PostgreSQL database

2. **Set Up Environment Variables**

3. **Frontend:**
- `npm install`: Install frontend dependencies.
- `npm run start`: Start the frontend development server.

4. **Backend:**
- `npm install`: Install backend dependencies.
- `npm run build`: Build typescript files.
- `npm run setup:dev`: Setup development environment for backend.
- `npm run dev`: Start the backend development server.

This setup should get your project running with both frontend and backend components integrated with PostgreSQL.

# Testing

Tests run against a dedicated `discord_sale_notifier_test` database — never the dev database.

1. `npm run setup:test` in `backend/` (first time, or anytime — creates the DB and ensures tables; safe to re-run).
2. `npm run test:server` in `backend/` (API on `:8080`, backed by the test DB).
3. `npm run start` in `frontend/` (`:3000`, proxies `/api` to `:8080`).
4. `$env:NODE_ENV='test'; npx playwright test --project=chromium` in `tests/`.

Run `npm run typecheck` in `tests/` to catch type errors without running browsers (also runs in CI).

Test env files (`backend/.env.test`, `tests/src/config/.env.test`) are gitignored locals; copy the `.development` variants to create them. The `setup db` Playwright project truncates `webhooks` before browser tests, so always run whole files/projects — never repeat a lone `add` test, or the leftover row makes the rerun fail with "already exists".

# Running with Docker

One container per service (3 total), orchestrated with Docker Compose:

- `db` — PostgreSQL 16 (data persisted in the `pgdata` volume, tables created on first start)
- `backend` — Express API on `http://localhost:8080`
- `frontend` — React build served by nginx on `http://localhost` (`/api/*` is proxied to the backend, so no CORS setup needed)

1. Copy `.env.example` to `.env` and adjust credentials if needed (defaults work out of the box).
2. `docker compose up --build`
3. Open `http://localhost`. API docs at `http://localhost:8080/api-docs`.

To reset the database (deletes all webhooks/sales): `docker compose down -v`

> Note: the local `postgresql-x64-17` Windows service holds host port 5432, so `.env` maps the DB to `5433` on the host. The backend still reaches it internally on `5432`. To use the standard host port, run `net stop postgresql-x64-17` from an elevated prompt and set `DB_PORT=5432` in `.env`.

> E2E tests vs Docker: the Playwright suite uses the local test stack (`npm run test:server` + `npm run start`, test database). `docker compose up` runs its own backend on the same `:8080` with its own database — so stop the stack (`docker compose stop`) before running e2e, or API writes and DB assertions will land in different databases and tests will fail.
