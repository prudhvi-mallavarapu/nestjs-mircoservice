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

## Dynamic Form

The signup form at `/form-demo` is driven by `frontend/src/lib/formConfig.ts`.
Change `fieldType` from `TEXT` to `LIST` or `RADIO` to see the component swap live.
Submissions persist to localStorage.
