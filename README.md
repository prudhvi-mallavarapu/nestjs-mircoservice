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
              │  Next.js Frontend  │  :3003
              │  (MUI + RHF)       │
              └──────┬──────┬──────┘
                     │ HTTP │ HTTP
           ┌─────────▼──┐  ┌▼────────────┐
           │  product-  │  │   order-    │
           │  service   │  │   service   │
           │  :5001     │  │   :5002     │
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
| **Frontend** | UI, form state, calls backend REST APIs via Next.js proxy rewrites |
| **product-service** | Product CRUD over HTTP; stock reservation over TCP (NestJS hybrid app) |
| **order-service** | Order CRUD over HTTP; delegates stock checks to product-service via TCP |
| **SQLite** | Each service owns its own database file — no shared DB |

---

## How It Works

### Product Service

Runs as a NestJS **hybrid application** — both an HTTP server (`:5001`) and a TCP microservice (`:4001`) in the same process.

The TCP layer exposes two message patterns consumed by order-service:

| Pattern | Payload | Returns |
|---------|---------|---------|
| `reserve_stock` | `{ id, quantity }` | `{ success, price, name, category }` |
| `release_stock` | `{ id, quantity }` | void |

`reserve_stock` runs inside a single database transaction: reads current stock, checks sufficiency, decrements atomically, and returns the product name/category alongside the price so order-service can snapshot them. `release_stock` increments stock back (used when an order is cancelled via PATCH or deleted via DELETE).

### Order Service

HTTP-only. On `POST /orders`:

1. Iterates the requested items **sequentially** — calls `reserve_stock` over TCP for each.
2. **Fail-fast**: if any item has insufficient stock, a `400 Bad Request` is returned immediately.
3. Snapshots `unitPrice`, `productName`, and `productCategory` from the reservation into `OrderItem` — product changes or deletions after order creation do not affect existing orders.
4. Calculates and stores `totalAmount`.

On reads, order items are served directly from the snapshot — no live TCP lookup to product-service.

### Frontend

Three pages, all driven by the backend REST APIs or local state:

- **Products** (`/`) — create/delete products; searchable list with sort, filter, grid/list toggle.
- **Orders** (`/orders`) — place orders by selecting products and quantities; filter by status (All / Confirmed / Cancelled); cancel orders with confirmation.
- **Form Demo** (`/form-demo`) — JSON-driven dynamic form; submissions persist to `localStorage`.

### Dynamic Form

The form at `/form-demo` is driven by `frontend/src/lib/formConfig.ts`. Each field config object has a `fieldType` property:

| `fieldType` | Renders as |
|------------|-----------|
| `TEXT` | MUI `TextField` |
| `LIST` | MUI `Select` (dropdown) |
| `RADIO` | MUI `RadioGroup` |

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

### 1. Install dependencies

```bash
# Backend
pnpm install

# Frontend
cd frontend && pnpm install && cd ..
```

### 2. Start both backend services

```bash
pnpm start:backend
```

Starts product-service on `:5001` (TCP `:4001`) and order-service on `:5002`.

### 3. Start the frontend (new terminal, once backends are ready)

```bash
pnpm start:frontend
```

Open **http://localhost:3003**.

### Individual service scripts

```bash
pnpm start:product   # product-service only  (:5001 HTTP, :4001 TCP)
pnpm start:order     # order-service only    (:5002 HTTP)
```

### Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `5001` / `5002` | Override HTTP listen port for each service |
| `PRODUCT_SERVICE_HOST` | `localhost` | TCP host order-service connects to |
| `PRODUCT_SERVICE_PORT` | `4001` | TCP port order-service connects to |
| `PRODUCT_BASE` | `http://localhost:5001` | Frontend proxy target for product-service |
| `ORDER_BASE` | `http://localhost:5002` | Frontend proxy target for order-service |

`PRODUCT_BASE` and `ORDER_BASE` are read by `frontend/next.config.ts` and can be set in `frontend/.env.local`.

---

## API Reference

### Product Service (`:5001`)

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
  "category": "Audio"
}
```

### Order Service (`:5002`)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/orders` | Place an order (reserves stock) |
| `GET` | `/orders` | List all orders |
| `GET` | `/orders/:id` | Get one order |
| `PATCH` | `/orders/:id` | Update order status |
| `DELETE` | `/orders/:id` | Delete an order (restores stock) |

**POST /orders — example body:**
```json
{
  "items": [
    { "productId": "<uuid>", "quantity": 2 },
    { "productId": "<uuid>", "quantity": 1 }
  ]
}
```

**Order status values:** `CONFIRMED` | `CANCELLED`

---

## Frontend Pages

| Route | What it does |
|-------|-------------|
| `/` | Create/delete products. Search, sort, filter by category, grid/list toggle. |
| `/orders` | Place orders; filter by status; cancel orders with confirmation. |
| `/form-demo` | JSON-driven dynamic form. Submissions persist to `localStorage`. |

---

## Project Structure

```
nestjs-microservice/
├── apps/
│   ├── product-service/
│   │   └── src/
│   │       ├── product/
│   │       │   ├── product.entity.ts          # TypeORM entity
│   │       │   ├── product.service.ts         # CRUD + reserveStock + releaseStock
│   │       │   ├── product.controller.ts      # REST endpoints
│   │       │   └── product.tcp.controller.ts  # TCP message handlers
│   │       ├── app.module.ts
│   │       └── main.ts                        # Hybrid HTTP + TCP bootstrap
│   └── order-service/
│       └── src/
│           ├── order/
│           │   ├── order.entity.ts            # Order entity
│           │   ├── order-item.entity.ts       # OrderItem entity (snapshotted product info)
│           │   ├── order.service.ts           # CRUD + TCP client calls
│           │   ├── order.controller.ts        # REST endpoints
│           │   └── order.module.ts            # Registers TCP client
│           ├── app.module.ts
│           └── main.ts
├── frontend/
│   └── src/
│       ├── app/                               # Next.js App Router pages
│       │   ├── page.tsx                       # /  (Products)
│       │   ├── orders/page.tsx                # /orders
│       │   └── form-demo/page.tsx             # /form-demo
│       ├── components/
│       │   ├── ToastProvider.tsx              # MUI Snackbar toast context
│       │   ├── ThemeRegistry.tsx              # MUI SSR emotion cache
│       │   ├── NavBar.tsx
│       │   ├── ProductForm.tsx
│       │   ├── ProductList.tsx
│       │   ├── OrderForm.tsx
│       │   ├── OrderList.tsx
│       │   └── DynamicField.tsx              # Renders TEXT/LIST/RADIO
│       ├── hooks/
│       │   ├── useJsonConfig.ts               # Live JSON editor state + validation
│       │   └── useSubmissions.ts              # localStorage submission history
│       ├── lib/
│       │   ├── api.ts                         # Fetch wrappers with retry
│       │   └── formConfig.ts                  # JSON field definitions
│       └── types/index.ts                     # Shared TypeScript types
├── nest-cli.json                              # Monorepo config
└── package.json                              # Root deps + scripts
```

---

## Running Tests

```bash
pnpm test
```

Unit tests cover `ProductService` (CRUD + reserveStock branches) and `OrderService` (create flow, TCP interaction).
