# Microservice Application Design

**Date:** 2026-06-28  
**Stack:** NestJS monorepo + Next.js frontend, TypeORM + SQLite, TCP transport

---

## Architecture

Single repo containing:
- `apps/product-service` — NestJS hybrid app (HTTP :3001 + TCP :4001)
- `apps/order-service` — NestJS HTTP :3002 (TCP client → :4001)
- `frontend/` — Next.js :3000 (MUI + react-hook-form)

```
Frontend (Next.js :3000)
  │
  ├── REST → Product Service (:3001) → products.db
  │              ▲
  │              │ TCP
  └── REST → Order Service (:3002) → orders.db
```

**Key principles:**
- Each service owns its own SQLite DB — no shared database
- Inter-service communication via NestJS TCP transport only
- Frontend calls each service's REST API directly

---

## Data Schemas

### Product Service (`products.db`)

```
Product
├── id          UUID (PK, auto-generated)
├── name        string (required)
├── description string (optional)
├── price       decimal (required, > 0)
├── stock       integer (required, >= 0)
├── category    string (optional)
├── createdAt   timestamp
└── updatedAt   timestamp
```

### Order Service (`orders.db`)

```
Order
├── id          UUID (PK, auto-generated)
├── status      enum: PENDING | CONFIRMED | CANCELLED
├── totalAmount decimal (sum of items at creation time)
├── createdAt   timestamp
└── updatedAt   timestamp

OrderItem
├── id          UUID (PK, auto-generated)
├── orderId     UUID (FK → Order)
├── productId   UUID (plain ref — no cross-DB FK)
├── quantity    integer
└── unitPrice   decimal (price snapshot at order creation)
```

**Note:** `unitPrice` is snapshotted at order creation so historical orders remain accurate if product prices change later.

---

## REST API

### Product Service (:3001)

| Method | Path | Description |
|--------|------|-------------|
| POST | /products | Create a product |
| GET | /products | List all products |
| GET | /products/:id | Get product by ID |
| PATCH | /products/:id | Update product |
| DELETE | /products/:id | Delete product |

### Order Service (:3002)

| Method | Path | Description |
|--------|------|-------------|
| POST | /orders | Create order (TCP call to product service) |
| GET | /orders | List all orders with product details |
| GET | /orders/:id | Get order by ID with product details |
| PATCH | /orders/:id | Update order status |
| DELETE | /orders/:id | Cancel/delete order |

**POST /orders request:**
```json
{
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ]
}
```

**GET /orders response:**
```json
{
  "id": "uuid",
  "status": "CONFIRMED",
  "totalAmount": 49.98,
  "items": [
    {
      "productId": "uuid",
      "productName": "Widget",
      "quantity": 2,
      "unitPrice": 24.99
    }
  ]
}
```

---

## TCP Message Contracts

Order service sends to product service over TCP:

| Pattern | Payload | Response |
|---------|---------|----------|
| `get_product` | `{ id: string }` | `Product` or `null` |
| `validate_stock` | `{ id: string, quantity: number }` | `{ valid: boolean, price: number }` |
| `decrement_stock` | `{ id: string, quantity: number }` | `{ success: boolean }` |

**Order creation flow:**
1. For each item, send `validate_stock` → get price + confirm stock available
2. Create Order + OrderItems with snapshotted `unitPrice`
3. For each item, send `decrement_stock` → reduce product stock
4. Return created order

---

## Frontend (Next.js)

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Products list + create product form |
| `/orders` | Orders list + create order form |
| `/form-demo` | Dynamic JSON-driven signup form showcase |

### Dynamic Form Engine

`DynamicField` component renders based on `fieldType`:

| fieldType | MUI Component |
|-----------|--------------|
| `TEXT` | `<TextField>` with minLength/maxLength |
| `LIST` | `<Select>` with listOfValues1 as options |
| `RADIO` | `<RadioGroup>` with listOfValues1 as options |

Validation (`required`, `minLength`, `maxLength`) wired directly from JSON into react-hook-form rules.

### Form JSON Config

```json
{
  "data": [
    { "id": 1, "name": "Full Name", "fieldType": "TEXT", "minLength": 1, "maxLength": 100, "defaultValue": "John Doe", "required": true },
    { "id": 2, "name": "Email", "fieldType": "TEXT", "minLength": 1, "maxLength": 50, "defaultValue": "hello@mail.com", "required": true },
    { "id": 6, "name": "Gender", "fieldType": "LIST", "defaultValue": "1", "required": true, "listOfValues1": ["Male", "Female", "Others"] },
    { "id": 7, "name": "Love React?", "fieldType": "RADIO", "defaultValue": "1", "required": true, "listOfValues1": ["Yes", "No"] }
  ]
}
```

### Folder Structure

```
frontend/
  app/
    page.tsx              ← products page
    orders/page.tsx       ← orders page
    form-demo/page.tsx    ← dynamic form demo
  components/
    DynamicField.tsx      ← TEXT | LIST | RADIO switcher
    ProductForm.tsx
    OrderForm.tsx
  lib/
    api.ts                ← fetch wrappers for both services
    formConfig.ts         ← JSON field definitions
```

### Data Persistence
- Form demo submissions saved to `localStorage`
- Products/orders data fetched from and written to backend REST APIs

---

## Monorepo Structure

```
nestjs-microservice/
  apps/
    product-service/
    order-service/
  frontend/
  nest-cli.json           ← monorepo mode
  package.json
  docs/
  README.md
```

---

## Out of Scope
- Authentication/authorization
- Docker / docker-compose (SQLite keeps setup minimal)
- Shared NestJS library (`libs/`) — not needed for 2 services
- Message queue (RabbitMQ, Kafka) — TCP is sufficient for this assignment
