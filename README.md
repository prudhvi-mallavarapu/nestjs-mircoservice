# Microservice Application

NestJS monorepo (product-service + order-service) with a Next.js frontend.

## Architecture

- **product-service** — REST API (:3001) + TCP microservice (:4001), SQLite
- **order-service** — REST API (:3002), calls product-service over TCP, SQLite
- **frontend** — Next.js + MUI + react-hook-form (:3000)

## Prerequisites

- Node.js ≥ 18
- pnpm (`npm install -g pnpm`)

## Running Locally

### 1. Install backend dependencies

```bash
pnpm install
```

### 2. Start product-service

```bash
pnpm start:product
```

Runs on http://localhost:3001 (HTTP) and TCP :4001.

### 3. Start order-service (new terminal)

```bash
pnpm start:order
```

Runs on http://localhost:3002.

### 4. Start frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## API Reference

### Product Service (:3001)

| Method | Path | Body |
|--------|------|------|
| POST | /products | `{ name, price, stock, description?, category? }` |
| GET | /products | — |
| GET | /products/:id | — |
| PATCH | /products/:id | partial product fields |
| DELETE | /products/:id | — |

### Order Service (:3002)

| Method | Path | Body |
|--------|------|------|
| POST | /orders | `{ items: [{ productId, quantity }] }` |
| GET | /orders | — |
| GET | /orders/:id | — |
| PATCH | /orders/:id | `{ status: PENDING|CONFIRMED|CANCELLED }` |
| DELETE | /orders/:id | — |

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Create and list products |
| `/orders` | Place and list orders |
| `/form-demo` | JSON-driven dynamic signup form |

## Running Tests

```bash
pnpm test
```

## Known Limitations

This project is a demo/assignment and intentionally omits several production concerns:

- **Partial order failure leaks stock** — during order creation, `reserve_stock` is called for each item in sequence. If a later item fails (insufficient stock), stock already decremented for earlier items in the same order is never restored. There is no basket-level rollback.
- **Cancelling or deleting an order does not restore stock** — `DELETE /orders/:id` and `PATCH /orders/:id` (status change to `CANCELLED`) do not emit a compensating event to product-service. Reserved stock remains decremented.
- **`synchronize: true` is development-only** — TypeORM's `synchronize: true` auto-migrates the schema on startup. This must be disabled and replaced with explicit migrations before any production deployment.
- **CORS is wildcard-open** — `app.enableCors()` with no origin restriction is intentional for local development convenience. Restrict the `origin` option before deploying to a shared environment.

## Dynamic Form

The signup form at `/form-demo` is driven by `frontend/src/lib/formConfig.ts`.
Change `fieldType` from `TEXT` to `LIST` or `RADIO` to see the component swap live.
Submissions persist to localStorage.
