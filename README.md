# Microservice Application

A full-stack microservice application built as an assignment. Two NestJS backend services communicate over TCP, each persisting to SQLite. A Next.js frontend consumes their REST APIs and demonstrates a JSON-driven dynamic form.

---

## Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                              │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP
              ┌─────────▼──────────┐
              │  Next.js Frontend  │  :3000
              │  (MUI + RHF)       │
              └──────┬──────┬──────┘
                     │ HTTP │ HTTP
           ┌─────────▼──┐  ┌▼────────────┐
           │  product-  │  │   order-    │
           │  service   │  │   service   │
           │  :3001     │  │   :3002     │
           │  TCP :4001 │◄─┤  TCP client │
           └─────┬──────┘  └──────┬──────┘
                 │                │
           ┌─────▼──────┐  ┌──────▼──────┐
           │ products.db│  │  orders.db  │
           │  (SQLite)  │  │  (SQLite)   │
           └────────────┘  └─────────────┘
```

| Layer | Responsibility |
|-------|---------------|
| **Frontend** | UI, form state, calls backend REST APIs, localStorage for form demo |
| **product-service** | Product CRUD over HTTP; stock reservation over TCP (NestJS hybrid app) |
| **order-service** | Order CRUD over HTTP; delegates stock checks to product-service via TCP |
| **SQLite** | Each service owns its own database file — no shared DB |

---

## How It Works

### Product Service

Runs as a NestJS **hybrid application** — both an HTTP server (`:3001`) and a TCP microservice (`:4001`) in the same process.

The TCP layer exposes two message patterns consumed by order-service:

| Pattern | Payload | Returns |
|---------|---------|---------|
| `get_product` | `{ id }` | product name + category (or `null`) |
| `reserve_stock` | `{ id, quantity }` | `{ success, price }` |

`reserve_stock` runs inside a single database transaction: it reads the current stock, checks sufficiency, and decrements — atomically. No separate "check then decrement" window.

### Order Service

HTTP-only. On `POST /orders`:

1. Iterates the requested items **sequentially** — calls `reserve_stock` over TCP for each.
2. **Fail-fast**: if any item has insufficient stock, a `400 Bad Request` is returned immediately. Stock already reserved for earlier items in the same request is **not** rolled back (see Known Limitations).
3. Snapshots `unitPrice` from the reservation into `OrderItem` — price changes after order creation do not affect existing orders.
4. Calculates and stores `totalAmount`.

On reads (`GET /orders`, `GET /orders/:id`), each order is **enriched** with product names and categories via `get_product` TCP calls.

### Frontend

Three pages, all driven by the backend REST APIs or local state:

- **Products** (`/`) — create/delete products; list table with live data from product-service.
- **Orders** (`/orders`) — place orders by selecting a product and quantity; list shows enriched order data (product names, totals).
- **Form Demo** (`/form-demo`) — JSON-driven dynamic form (see below); submissions persist to `localStorage`.

### Dynamic Form

The form at `/form-demo` is driven by `frontend/src/lib/formConfig.ts`. Each field config object has a `fieldType` property:

| `fieldType` | Renders as |
|------------|-----------|
| `TEXT` | MUI `TextField` |
| `LIST` | MUI `Select` (dropdown) |
| `RADIO` | MUI `RadioGroup` |

The `DynamicField` component (`frontend/src/components/DynamicField.tsx`) reads `fieldType` at render time. Changing a field's `fieldType` in the config file — or swapping any other prop like `name`, `required`, `minLength`, `listOfValues1` — takes effect immediately with no other code changes.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend framework | NestJS 11 (monorepo mode) |
| Inter-service transport | NestJS TCP microservice (`@nestjs/microservices`) |
| ORM + database | TypeORM 1.0 + better-sqlite3 |
| Validation | class-validator + class-transformer + NestJS ValidationPipe |
| Frontend framework | Next.js 16 (App Router) |
| UI library | Material UI 9 |
| Form handling | react-hook-form |
| Language | TypeScript throughout |
| Package manager | pnpm 10 |

---

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** — `npm install -g pnpm`

---

## Running Locally

### 1. Clone and install backend dependencies

```bash
git clone <repo-url>
cd nestjs-microservice
pnpm install
```

### 2. Start product-service

```bash
pnpm start:product
```

Starts HTTP on `:3001` and TCP on `:4001`.

### 3. Start order-service (new terminal)

```bash
pnpm start:order
```

Starts HTTP on `:3002`. Connects to product-service TCP on `:4001`.

### 4. Start the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**.

### Environment variables (optional)

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3001` / `3002` | Override HTTP listen port for each service |
| `PRODUCT_SERVICE_HOST` | `localhost` | TCP host order-service connects to |
| `PRODUCT_SERVICE_PORT` | `4001` | TCP port order-service connects to |

---

## API Reference

### Product Service (`:3001`)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/products` | Create a product |
| `GET` | `/products` | List all products |
| `GET` | `/products/:id` | Get one product |
| `PATCH` | `/products/:id` | Update a product |
| `DELETE` | `/products/:id` | Delete a product |

**POST /products — example body:**
```json
{
  "name": "Wireless Headphones",
  "price": 79.99,
  "stock": 50,
  "description": "Over-ear, noise cancelling",
  "category": "Electronics"
}
```

### Order Service (`:3002`)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/orders` | Place an order (reserves stock) |
| `GET` | `/orders` | List all orders (enriched with product names) |
| `GET` | `/orders/:id` | Get one order |
| `PATCH` | `/orders/:id` | Update order status |
| `DELETE` | `/orders/:id` | Delete an order |

**POST /orders — example body:**
```json
{
  "items": [
    { "productId": "<uuid>", "quantity": 2 },
    { "productId": "<uuid>", "quantity": 1 }
  ]
}
```

**Order status values:** `PENDING` | `CONFIRMED` | `CANCELLED`

---

## Frontend Pages

| Route | What it does |
|-------|-------------|
| `/` | Create products (name, price, stock, description, category). List all products in a table with delete. |
| `/orders` | Place orders by entering a product ID and quantity; add multiple line items. List shows order ID, status, total, item count with product names. |
| `/form-demo` | JSON-driven signup form. Submit stores to `localStorage`; past submissions shown below the form. |

---

## Project Structure

```
nestjs-microservice/
├── apps/
│   ├── product-service/
│   │   └── src/
│   │       ├── product/
│   │       │   ├── product.entity.ts       # TypeORM entity
│   │       │   ├── product.service.ts      # CRUD + reserveStock
│   │       │   ├── product.controller.ts   # REST endpoints
│   │       │   └── product.tcp.controller.ts  # TCP message handlers
│   │       ├── app.module.ts
│   │       └── main.ts                     # Hybrid HTTP + TCP bootstrap
│   └── order-service/
│       └── src/
│           ├── order/
│           │   ├── order.entity.ts         # Order + OrderItem entities
│           │   ├── order.service.ts        # CRUD + TCP client calls
│           │   ├── order.controller.ts     # REST endpoints
│           │   └── order.module.ts         # Registers TCP client
│           ├── app.module.ts
│           └── main.ts
├── frontend/
│   └── src/
│       ├── app/                            # Next.js App Router pages
│       │   ├── page.tsx                    # /  (Products)
│       │   ├── orders/page.tsx             # /orders
│       │   └── form-demo/page.tsx          # /form-demo
│       ├── components/
│       │   ├── DynamicField.tsx            # Renders TEXT/LIST/RADIO
│       │   ├── ThemeRegistry.tsx           # MUI SSR emotion cache
│       │   ├── NavBar.tsx
│       │   ├── ProductForm.tsx
│       │   ├── ProductList.tsx
│       │   ├── OrderForm.tsx
│       │   └── OrderList.tsx
│       ├── lib/
│       │   ├── api.ts                      # Fetch wrappers for both services
│       │   └── formConfig.ts               # JSON field definitions
│       └── types/index.ts                  # Shared TypeScript types
├── nest-cli.json                           # Monorepo config
└── package.json                            # Root deps + scripts
```

---

## Running Tests

```bash
pnpm test
```

Unit tests cover `ProductService` (CRUD + reserveStock branches) and `OrderService` (create flow, TCP interaction, enrichment). All 8 tests pass.

---

## Known Limitations

This project is a demo/assignment and intentionally omits several production concerns:

- **Partial order failure leaks stock** — during order creation, `reserve_stock` is called for each item in sequence. If a later item fails (insufficient stock), stock already decremented for earlier items in the same order is never restored. There is no basket-level rollback.
- **Cancelling or deleting an order does not restore stock** — `DELETE /orders/:id` and `PATCH /orders/:id` (status change to `CANCELLED`) do not emit a compensating event to product-service. Reserved stock remains decremented.
- **`synchronize: true` is development-only** — TypeORM's `synchronize: true` auto-migrates the schema on startup. This must be disabled and replaced with explicit migrations before any production deployment.
- **CORS is wildcard-open** — `app.enableCors()` with no origin restriction is intentional for local development convenience. Restrict the `origin` option before deploying to a shared environment.
