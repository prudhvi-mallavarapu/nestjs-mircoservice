# Microservice Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a NestJS monorepo (product-service + order-service, TCP inter-service communication, SQLite) and a Next.js frontend with MUI, react-hook-form, and a JSON-driven dynamic form.

**Architecture:** Two NestJS apps under `apps/`; product-service runs as a hybrid (HTTP :3001 + TCP :4001), order-service runs HTTP only (:3002) and holds a TCP client to call product-service. Each service owns its own SQLite file. The Next.js frontend in `frontend/` calls each service's REST API directly from the browser.

**Tech Stack:** NestJS 11, `@nestjs/microservices` (TCP), TypeORM + sqlite3, class-validator, class-transformer, Next.js 15, MUI 5, `@mui/material-nextjs`, react-hook-form

## Global Constraints

- Node.js ≥ 18 (repo is on v25)
- pnpm for backend (root `package.json`); npm for frontend (`frontend/package.json`)
- `tsconfig.json` uses `"module": "nodenext"` — write relative imports without `.js` extension (NestJS CLI handles it)
- Product service: HTTP port 3001, TCP port 4001
- Order service: HTTP port 3002
- Frontend: port 3000
- All NestJS services call `app.enableCors()` for browser access
- `synchronize: true` in TypeORM config (dev/demo only — auto-creates tables)
- No auth, no Docker, no message queues

---

### Task 1: NestJS Monorepo Scaffold + Dependencies

**Files:**
- Modify: `nest-cli.json`
- Modify: `package.json`
- Create: `apps/product-service/tsconfig.app.json`
- Create: `apps/product-service/src/main.ts`
- Create: `apps/product-service/src/app.module.ts`
- Create: `apps/order-service/tsconfig.app.json`
- Create: `apps/order-service/src/main.ts`
- Create: `apps/order-service/src/app.module.ts`
- Delete: `src/` (old single-app scaffold — no longer used)

**Interfaces:**
- Produces: `pnpm start:product` and `pnpm start:order` both boot without errors

- [ ] **Step 1: Install backend dependencies**

```bash
cd /path/to/nestjs-microservice
pnpm add @nestjs/typeorm typeorm sqlite3 class-validator class-transformer @nestjs/mapped-types
pnpm add -D @types/sqlite3
```

- [ ] **Step 2: Update `nest-cli.json` to monorepo mode**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "apps/product-service/src",
  "monorepo": true,
  "root": "apps/product-service",
  "compilerOptions": {
    "deleteOutDir": true
  },
  "projects": {
    "product-service": {
      "type": "application",
      "root": "apps/product-service",
      "entryFile": "main",
      "sourceRoot": "apps/product-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/product-service/tsconfig.app.json"
      }
    },
    "order-service": {
      "type": "application",
      "root": "apps/order-service",
      "entryFile": "main",
      "sourceRoot": "apps/order-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/order-service/tsconfig.app.json"
      }
    }
  }
}
```

- [ ] **Step 3: Update `package.json` scripts and Jest config**

Replace the `scripts` block and `jest` block with:

```json
{
  "scripts": {
    "start:product": "nest start product-service --watch",
    "start:order": "nest start order-service --watch",
    "build:product": "nest build product-service",
    "build:order": "nest build order-service",
    "lint": "eslint \"{apps}/**/*.ts\" --fix",
    "test": "jest",
    "test:cov": "jest --coverage"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": ".",
    "testMatch": ["<rootDir>/apps/**/*.spec.ts"],
    "transform": {
      "^.+\\.(t|j)s$": ["ts-jest", { "tsconfig": "tsconfig.json" }]
    },
    "collectCoverageFrom": ["apps/**/*.(t|j)s"],
    "coverageDirectory": "./coverage",
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 4: Create `apps/product-service/tsconfig.app.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "declaration": false,
    "outDir": "../../dist/apps/product-service"
  },
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

- [ ] **Step 5: Create `apps/order-service/tsconfig.app.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "declaration": false,
    "outDir": "../../dist/apps/order-service"
  },
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

- [ ] **Step 6: Create `apps/product-service/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class AppModule {}
```

- [ ] **Step 7: Create `apps/product-service/src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: 4001 },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log('Product service HTTP :3001, TCP :4001');
}
bootstrap();
```

- [ ] **Step 8: Create `apps/order-service/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class AppModule {}
```

- [ ] **Step 9: Create `apps/order-service/src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  await app.listen(3002);
  console.log('Order service HTTP :3002');
}
bootstrap();
```

- [ ] **Step 10: Remove old src/**

```bash
git rm -r src/
```

- [ ] **Step 11: Verify both services compile**

```bash
pnpm build:product
pnpm build:order
```

Expected: both output to `dist/apps/product-service` and `dist/apps/order-service` with no errors.

- [ ] **Step 12: Commit**

```bash
git add apps/ nest-cli.json package.json
git commit -m "feat: convert to NestJS monorepo with product-service and order-service scaffolds"
```

---

### Task 2: Product Entity + Module + TypeORM Setup

**Files:**
- Create: `apps/product-service/src/product/product.entity.ts`
- Create: `apps/product-service/src/product/dto/create-product.dto.ts`
- Create: `apps/product-service/src/product/dto/update-product.dto.ts`
- Create: `apps/product-service/src/product/product.module.ts`
- Modify: `apps/product-service/src/app.module.ts`

**Interfaces:**
- Produces: `Product` entity and DTOs consumed by Tasks 3 and 4

- [ ] **Step 1: Create `apps/product-service/src/product/product.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: Create `apps/product-service/src/product/dto/create-product.dto.ts`**

```typescript
import { IsString, IsNumber, IsOptional, IsPositive, Min, IsInt } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  category?: string;
}
```

- [ ] **Step 3: Create `apps/product-service/src/product/dto/update-product.dto.ts`**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

- [ ] **Step 4: Create `apps/product-service/src/product/product.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
})
export class ProductModule {}
```

- [ ] **Step 5: Update `apps/product-service/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product/product.entity';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'products.db',
      entities: [Product],
      synchronize: true,
    }),
    ProductModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Start product service and verify `products.db` is created**

```bash
pnpm start:product
```

Expected: service starts, `products.db` file appears in repo root, no TypeORM errors.

Stop the service (Ctrl+C).

- [ ] **Step 7: Commit**

```bash
git add apps/product-service/
git commit -m "feat: add Product entity, DTOs, and TypeORM SQLite setup to product-service"
```

---

### Task 3: Product CRUD Service + REST Controller + Tests

**Files:**
- Create: `apps/product-service/src/product/product.service.ts`
- Create: `apps/product-service/src/product/product.service.spec.ts`
- Create: `apps/product-service/src/product/product.controller.ts`
- Modify: `apps/product-service/src/product/product.module.ts`

**Interfaces:**
- Produces: `ProductService` with methods `create`, `findAll`, `findOne`, `update`, `remove`, `reserveStock` — consumed by Task 4

- [ ] **Step 1: Write failing test for `ProductService`**

Create `apps/product-service/src/product/product.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';

const mockProduct: Product = {
  id: 'uuid-1',
  name: 'Widget',
  description: 'A widget',
  price: 24.99,
  stock: 10,
  category: 'gadgets',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepo = {
  create: jest.fn().mockReturnValue(mockProduct),
  save: jest.fn().mockResolvedValue(mockProduct),
  find: jest.fn().mockResolvedValue([mockProduct]),
  findOne: jest.fn().mockResolvedValue(mockProduct),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
};

const mockDataSource = { transaction: jest.fn() };

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: mockRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get(ProductService);
  });

  it('findAll returns array', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockProduct]);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('create returns saved product', async () => {
    const result = await service.create({ name: 'Widget', price: 24.99, stock: 10 });
    expect(result).toEqual(mockProduct);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('reserveStock returns success=false when stock insufficient', async () => {
    mockDataSource.transaction.mockImplementationOnce(async (cb: any) =>
      cb({ findOne: jest.fn().mockResolvedValue({ ...mockProduct, stock: 0 }), update: jest.fn() }),
    );
    const result = await service.reserveStock('uuid-1', 5);
    expect(result).toEqual({ success: false, price: 0 });
  });

  it('reserveStock decrements stock and returns price', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockDataSource.transaction.mockImplementationOnce(async (cb: any) =>
      cb({ findOne: jest.fn().mockResolvedValue({ ...mockProduct, stock: 10 }), update: mockUpdate }),
    );
    const result = await service.reserveStock('uuid-1', 3);
    expect(result.success).toBe(true);
    expect(result.price).toBe(24.99);
    expect(mockUpdate).toHaveBeenCalledWith(Product, 'uuid-1', { stock: 7 });
  });
});
```

- [ ] **Step 2: Run test — expect FAIL (ProductService not defined)**

```bash
pnpm test -- --testPathPattern="product.service.spec"
```

Expected: FAIL with "Cannot find module './product.service'"

- [ ] **Step 3: Create `apps/product-service/src/product/product.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  create(dto: CreateProductDto): Promise<Product> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Product[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  // Atomic: check stock and decrement in one SQLite transaction.
  // SQLite serializes writes so no row-level lock needed.
  async reserveStock(id: string, quantity: number): Promise<{ success: boolean; price: number }> {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, { where: { id } });
      if (!product || product.stock < quantity) {
        return { success: false, price: 0 };
      }
      await manager.update(Product, id, { stock: product.stock - quantity });
      return { success: true, price: Number(product.price) };
    });
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
pnpm test -- --testPathPattern="product.service.spec"
```

Expected: PASS (5 tests)

- [ ] **Step 5: Create `apps/product-service/src/product/product.controller.ts`**

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
```

- [ ] **Step 6: Update `apps/product-service/src/product/product.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
```

- [ ] **Step 7: Smoke-test the REST API**

```bash
pnpm start:product &
sleep 3
curl -s -X POST http://localhost:3001/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Widget","price":24.99,"stock":10,"category":"gadgets"}' | jq .
curl -s http://localhost:3001/products | jq .
```

Expected: POST returns the created product with a UUID; GET returns an array with that product.

Kill the background service after verifying.

- [ ] **Step 8: Commit**

```bash
git add apps/product-service/
git commit -m "feat: add ProductService CRUD, REST controller, and unit tests"
```

---

### Task 4: Product TCP Controller (get_product + reserve_stock)

**Files:**
- Create: `apps/product-service/src/product/product.tcp.controller.ts`
- Modify: `apps/product-service/src/product/product.module.ts`

**Interfaces:**
- Consumes: `ProductService.findOne(id)`, `ProductService.reserveStock(id, quantity)`
- Produces: TCP message handlers `get_product` and `reserve_stock` — consumed by order-service in Task 6

- [ ] **Step 1: Create `apps/product-service/src/product/product.tcp.controller.ts`**

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';

@Controller()
export class ProductTcpController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern('get_product')
  getProduct(@Payload() data: { id: string }) {
    return this.productService.findOne(data.id).catch(() => null);
  }

  @MessagePattern('reserve_stock')
  reserveStock(@Payload() data: { id: string; quantity: number }) {
    return this.productService.reserveStock(data.id, data.quantity);
  }
}
```

- [ ] **Step 2: Update `apps/product-service/src/product/product.module.ts` to include TCP controller**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductTcpController } from './product.tcp.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductService],
  controllers: [ProductController, ProductTcpController],
})
export class ProductModule {}
```

- [ ] **Step 3: Verify TCP port binds**

```bash
pnpm start:product &
sleep 3
# Should see both HTTP :3001 and TCP :4001 in output
lsof -i :4001 | grep LISTEN
```

Expected: a process listening on port 4001.

Kill the background service.

- [ ] **Step 4: Commit**

```bash
git add apps/product-service/
git commit -m "feat: add TCP message handlers get_product and reserve_stock to product-service"
```

---

### Task 5: Order Entities + Module + TypeORM Setup

**Files:**
- Create: `apps/order-service/src/order/order.entity.ts`
- Create: `apps/order-service/src/order/order-item.entity.ts`
- Create: `apps/order-service/src/order/dto/create-order.dto.ts`
- Create: `apps/order-service/src/order/dto/update-order.dto.ts`
- Create: `apps/order-service/src/order/order.module.ts`
- Modify: `apps/order-service/src/app.module.ts`

**Interfaces:**
- Produces: `Order`, `OrderItem`, `OrderStatus` — consumed by Task 6
- Produces: `CreateOrderDto`, `UpdateOrderDto` — consumed by Task 6

- [ ] **Step 1: Create `apps/order-service/src/order/order.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-enum', enum: OrderStatus, default: OrderStatus.CONFIRMED })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: Create `apps/order-service/src/order/order-item.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn()
  order: Order;

  @Column('uuid')
  productId: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;
}
```

- [ ] **Step 3: Create `apps/order-service/src/order/dto/create-order.dto.ts`**

```typescript
import { IsArray, ValidateNested, IsString, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
```

- [ ] **Step 4: Create `apps/order-service/src/order/dto/update-order.dto.ts`**

```typescript
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../order.entity';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
```

- [ ] **Step 5: Create `apps/order-service/src/order/order.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 4001 },
      },
    ]),
  ],
})
export class OrderModule {}
```

- [ ] **Step 6: Update `apps/order-service/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order/order.entity';
import { OrderItem } from './order/order-item.entity';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'orders.db',
      entities: [Order, OrderItem],
      synchronize: true,
    }),
    OrderModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 7: Verify order-service starts and creates `orders.db`**

```bash
pnpm start:order &
sleep 3
ls orders.db
```

Expected: `orders.db` exists, no TypeORM errors in console.

Kill the background service.

- [ ] **Step 8: Commit**

```bash
git add apps/order-service/
git commit -m "feat: add Order/OrderItem entities, DTOs, and TypeORM SQLite setup to order-service"
```

---

### Task 6: Order CRUD Service + REST Controller + Tests

**Files:**
- Create: `apps/order-service/src/order/order.service.ts`
- Create: `apps/order-service/src/order/order.service.spec.ts`
- Create: `apps/order-service/src/order/order.controller.ts`
- Modify: `apps/order-service/src/order/order.module.ts`

**Interfaces:**
- Consumes: TCP `reserve_stock` → `{ success: boolean; price: number }`, TCP `get_product` → `Product | null`
- Produces: `GET /orders`, `POST /orders`, `GET /orders/:id`, `PATCH /orders/:id`, `DELETE /orders/:id`

- [ ] **Step 1: Write failing test for `OrderService`**

Create `apps/order-service/src/order/order.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import { OrderService } from './order.service';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';

const mockOrder: Order = {
  id: 'order-1',
  status: OrderStatus.CONFIRMED,
  totalAmount: 49.98,
  items: [{ id: 'item-1', productId: 'prod-1', quantity: 2, unitPrice: 24.99, order: null as any }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOrderRepo = {
  create: jest.fn().mockReturnValue(mockOrder),
  save: jest.fn().mockResolvedValue(mockOrder),
  find: jest.fn().mockResolvedValue([mockOrder]),
  findOne: jest.fn().mockResolvedValue(mockOrder),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
};

const mockProductClient = {
  send: jest.fn(),
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: 'PRODUCT_SERVICE', useValue: mockProductClient },
      ],
    }).compile();
    service = module.get(OrderService);
  });

  it('create throws BadRequestException when reserve_stock fails', async () => {
    mockProductClient.send.mockReturnValueOnce(of({ success: false, price: 0 }));
    await expect(
      service.create({ items: [{ productId: 'prod-1', quantity: 2 }] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('create saves order when reserve_stock succeeds', async () => {
    mockProductClient.send
      .mockReturnValueOnce(of({ success: true, price: 24.99 })) // reserve_stock
      .mockReturnValueOnce(of({ id: 'prod-1', name: 'Widget' })); // get_product for enrich
    const result = await service.create({ items: [{ productId: 'prod-1', quantity: 2 }] });
    expect(mockOrderRepo.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockOrderRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
pnpm test -- --testPathPattern="order.service.spec"
```

Expected: FAIL with "Cannot find module './order.service'"

- [ ] **Step 3: Create `apps/order-service/src/order/order.service.ts`**

```typescript
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @Inject('PRODUCT_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const items: Partial<OrderItem>[] = [];
    let totalAmount = 0;

    for (const item of dto.items) {
      const reservation = await firstValueFrom(
        this.productClient.send<{ success: boolean; price: number }>('reserve_stock', {
          id: item.productId,
          quantity: item.quantity,
        }),
      );

      if (!reservation.success) {
        throw new BadRequestException(
          `Insufficient stock for product ${item.productId}`,
        );
      }

      items.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: reservation.price,
      });
      totalAmount += reservation.price * item.quantity;
    }

    const order = this.orderRepo.create({
      status: OrderStatus.CONFIRMED,
      totalAmount,
      items: items as OrderItem[],
    });

    const saved = await this.orderRepo.save(order);
    return this.enrichOrder(saved);
  }

  async findAll() {
    const orders = await this.orderRepo.find();
    return Promise.all(orders.map((o) => this.enrichOrder(o)));
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return this.enrichOrder(order);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    await this.findOne(id);
    await this.orderRepo.update(id, dto);
    return this.orderRepo.findOne({ where: { id } }) as Promise<Order>;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.orderRepo.delete(id);
  }

  private async enrichOrder(order: Order) {
    const enrichedItems = await Promise.all(
      order.items.map(async (item) => {
        const product = await firstValueFrom(
          this.productClient.send<{ name: string; category: string } | null>(
            'get_product',
            { id: item.productId },
          ),
        ).catch(() => null);

        return {
          ...item,
          productName: product?.name ?? 'Unknown',
          productCategory: product?.category ?? null,
        };
      }),
    );

    return { ...order, items: enrichedItems };
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
pnpm test -- --testPathPattern="order.service.spec"
```

Expected: PASS (3 tests)

- [ ] **Step 5: Create `apps/order-service/src/order/order.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
```

- [ ] **Step 6: Update `apps/order-service/src/order/order.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 4001 },
      },
    ]),
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
```

- [ ] **Step 7: End-to-end smoke test (both services running)**

Terminal 1:
```bash
pnpm start:product
```

Terminal 2:
```bash
pnpm start:order
```

Terminal 3:
```bash
# Create a product
PRODUCT=$(curl -s -X POST http://localhost:3001/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Widget","price":24.99,"stock":10}')
echo $PRODUCT | jq .
PRODUCT_ID=$(echo $PRODUCT | jq -r '.id')

# Create an order
curl -s -X POST http://localhost:3002/orders \
  -H 'Content-Type: application/json' \
  -d "{\"items\":[{\"productId\":\"$PRODUCT_ID\",\"quantity\":2}]}" | jq .

# List orders with product details
curl -s http://localhost:3002/orders | jq .
```

Expected: order response includes `productName: "Widget"`, `unitPrice: 24.99`, `totalAmount: 49.98`.
Also verify stock decremented: `curl -s http://localhost:3001/products/$PRODUCT_ID | jq .stock` → `8`.

- [ ] **Step 8: Commit**

```bash
git add apps/order-service/
git commit -m "feat: add OrderService with TCP client, REST controller, and unit tests"
```

---

### Task 7: Next.js Frontend Scaffold + MUI Theme

**Files:**
- Create: `frontend/` (via create-next-app)
- Create: `frontend/src/app/layout.tsx`
- Create: `frontend/src/components/ThemeRegistry.tsx`

**Interfaces:**
- Produces: working `npm run dev` at `http://localhost:3000` with MUI theme applied

- [ ] **Step 1: Scaffold Next.js app**

```bash
npx create-next-app@latest frontend \
  --typescript \
  --app \
  --no-tailwind \
  --no-eslint \
  --src-dir \
  --import-alias "@/*"
```

When prompted for the router: select **App Router** (default in Next.js 15).

- [ ] **Step 2: Install MUI and react-hook-form**

```bash
cd frontend
npm install @mui/material @mui/material-nextjs @emotion/react @emotion/styled @emotion/cache @mui/icons-material react-hook-form
cd ..
```

- [ ] **Step 3: Create `frontend/src/components/ThemeRegistry.tsx`**

```tsx
'use client';
import { ReactNode } from 'react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { useState } from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565c0' },
    secondary: { main: '#e91e63' },
  },
  shape: { borderRadius: 8 },
});

export function ThemeRegistry({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const c = createCache({ key: 'mui' });
    c.compat = true;
    const prevInsert = c.insert.bind(c);
    let inserted: string[] = [];
    c.insert = (...args) => {
      const name = args[1].name;
      if (c.inserted[name] === undefined) inserted.push(name);
      return prevInsert(...args);
    };
    return { cache: c, flush: () => { const p = inserted; inserted = []; return p; } };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (!names.length) return null;
    const styles = names.map((n) => cache.inserted[n]).join('');
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
```

- [ ] **Step 4: Update `frontend/src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { ThemeRegistry } from '@/components/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Microservice App',
  description: 'Product & Order management with dynamic forms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify MUI renders**

```bash
cd frontend && npm run dev
```

Open `http://localhost:3000`. Expected: default Next.js page loads with no console errors about MUI. Stop dev server.

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold Next.js frontend with MUI theme and ThemeRegistry"
```

---

### Task 8: Types, API Library, and Form Config

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/formConfig.ts`

**Interfaces:**
- Produces: `Product`, `Order`, `OrderItem`, `FieldConfig` types — consumed by Tasks 9–11
- Produces: `api.products.*` and `api.orders.*` — consumed by Tasks 9–10

- [ ] **Step 1: Create `frontend/src/types/index.ts`**

```typescript
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCategory: string | null;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FieldConfig {
  id: number;
  name: string;
  fieldType: 'TEXT' | 'LIST' | 'RADIO';
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  required: boolean;
  listOfValues1?: string[];
}
```

- [ ] **Step 2: Create `frontend/src/lib/api.ts`**

```typescript
import type { Product, Order } from '@/types';

const PRODUCT_BASE = 'http://localhost:3001';
const ORDER_BASE = 'http://localhost:3002';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  products: {
    list: () => request<Product[]>(`${PRODUCT_BASE}/products`),
    create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
      request<Product>(`${PRODUCT_BASE}/products`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) =>
      request<Product>(`${PRODUCT_BASE}/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<void>(`${PRODUCT_BASE}/products/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request<Order[]>(`${ORDER_BASE}/orders`),
    create: (data: { items: { productId: string; quantity: number }[] }) =>
      request<Order>(`${ORDER_BASE}/orders`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: Order['status']) =>
      request<Order>(`${ORDER_BASE}/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    remove: (id: string) =>
      request<void>(`${ORDER_BASE}/orders/${id}`, { method: 'DELETE' }),
  },
};
```

- [ ] **Step 3: Create `frontend/src/lib/formConfig.ts`**

```typescript
import type { FieldConfig } from '@/types';

export const formConfig: FieldConfig[] = [
  {
    id: 1,
    name: 'Full Name',
    fieldType: 'TEXT',
    minLength: 1,
    maxLength: 100,
    defaultValue: 'John Doe',
    required: true,
  },
  {
    id: 2,
    name: 'Email',
    fieldType: 'TEXT',
    minLength: 1,
    maxLength: 50,
    defaultValue: 'hello@mail.com',
    required: true,
  },
  {
    id: 6,
    name: 'Gender',
    fieldType: 'LIST',
    defaultValue: 'Male',
    required: true,
    listOfValues1: ['Male', 'Female', 'Others'],
  },
  {
    id: 7,
    name: 'Love React?',
    fieldType: 'RADIO',
    defaultValue: 'Yes',
    required: true,
    listOfValues1: ['Yes', 'No'],
  },
];
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/types/ frontend/src/lib/
git commit -m "feat: add shared types, API library, and form JSON config to frontend"
```

---

### Task 9: Products Page

**Files:**
- Create: `frontend/src/components/ProductForm.tsx`
- Create: `frontend/src/components/ProductList.tsx`
- Modify: `frontend/src/app/page.tsx`

**Interfaces:**
- Consumes: `api.products.*`, `Product` type

- [ ] **Step 1: Create `frontend/src/components/ProductForm.tsx`**

```tsx
'use client';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@/types';

interface FormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export function ProductForm({ onCreated }: { onCreated: (p: Product) => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
  const [error, setError] = useState('');

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      const product = await api.products.create({
        ...values,
        price: Number(values.price),
        stock: Number(values.stock),
      });
      onCreated(product);
      reset();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>Add Product</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        <TextField label="Name" {...register('name', { required: 'Required' })}
          error={!!errors.name} helperText={errors.name?.message} />
        <TextField label="Description" {...register('description')} />
        <TextField label="Price" type="number" inputProps={{ step: '0.01', min: '0' }}
          {...register('price', { required: 'Required' })}
          error={!!errors.price} helperText={errors.price?.message} />
        <TextField label="Stock" type="number" inputProps={{ min: '0' }}
          {...register('stock', { required: 'Required' })}
          error={!!errors.stock} helperText={errors.stock?.message} />
        <TextField label="Category" {...register('category')} />
        <Button type="submit" variant="contained">Create Product</Button>
      </Stack>
    </Box>
  );
}
```

- [ ] **Step 2: Create `frontend/src/components/ProductList.tsx`**

```tsx
'use client';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Paper, IconButton, Typography, Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Product } from '@/types';

interface Props {
  products: Product[];
  onDelete: (id: string) => void;
}

export function ProductList({ products, onDelete }: Props) {
  if (!products.length) return <Typography color="text.secondary">No products yet.</Typography>;

  return (
    <Paper>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Stock</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} hover>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.category ? <Chip label={p.category} size="small" /> : '—'}</TableCell>
              <TableCell align="right">${Number(p.price).toFixed(2)}</TableCell>
              <TableCell align="right">{p.stock}</TableCell>
              <TableCell align="right">
                <IconButton size="small" color="error" onClick={() => onDelete(p.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
```

- [ ] **Step 3: Update `frontend/src/app/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { Container, Typography, Divider, CircularProgress, Box } from '@mui/material';
import { ProductForm } from '@/components/ProductForm';
import { ProductList } from '@/components/ProductList';
import { api } from '@/lib/api';
import type { Product } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products.list()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (p: Product) => setProducts((prev) => [p, ...prev]);

  const handleDelete = async (id: string) => {
    await api.products.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Products</Typography>
      <ProductForm onCreated={handleCreated} />
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>Product List</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProductList products={products} onDelete={handleDelete} />
      )}
    </Container>
  );
}
```

- [ ] **Step 4: Test products page with both services running**

Start product-service and order-service, then:
```bash
cd frontend && npm run dev
```

Open `http://localhost:3000`. Create a product via the form. Verify it appears in the table. Delete it. Verify it disappears.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/
git commit -m "feat: add products page with create form and delete table"
```

---

### Task 10: Orders Page

**Files:**
- Create: `frontend/src/components/OrderForm.tsx`
- Create: `frontend/src/components/OrderList.tsx`
- Create: `frontend/src/app/orders/page.tsx`
- Modify: `frontend/src/app/layout.tsx` (add nav)

**Interfaces:**
- Consumes: `api.orders.*`, `api.products.list()`, `Order`, `Product` types

- [ ] **Step 1: Create `frontend/src/components/OrderForm.tsx`**

```tsx
'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Box, Button, TextField, Typography, Stack, Alert,
  IconButton, MenuItem, Select, InputLabel, FormControl,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { Order, Product } from '@/types';

interface FormValues {
  items: { productId: string; quantity: number }[];
}

export function OrderForm({
  products,
  onCreated,
}: {
  products: Product[];
  onCreated: (o: Order) => void;
}) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { items: [{ productId: '', quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const [error, setError] = useState('');

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      const order = await api.orders.create({
        items: values.items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
        })),
      });
      onCreated(order);
      reset();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>Create Order</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        {fields.map((field, idx) => (
          <Stack key={field.id} direction="row" spacing={1} alignItems="center">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Product</InputLabel>
              <Select
                label="Product"
                defaultValue=""
                {...register(`items.${idx}.productId`, { required: true })}
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} (stock: {p.stock})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Qty"
              type="number"
              inputProps={{ min: 1 }}
              sx={{ width: 80 }}
              {...register(`items.${idx}.quantity`, { required: true, min: 1 })}
            />
            <IconButton color="error" onClick={() => remove(idx)} disabled={fields.length === 1}>
              <RemoveIcon />
            </IconButton>
          </Stack>
        ))}
        <Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => append({ productId: '', quantity: 1 })}
          >
            Add Item
          </Button>
        </Box>
        <Button type="submit" variant="contained">Place Order</Button>
      </Stack>
    </Box>
  );
}
```

- [ ] **Step 2: Create `frontend/src/components/OrderList.tsx`**

```tsx
'use client';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Order } from '@/types';

const STATUS_COLOR: Record<Order['status'], 'success' | 'warning' | 'error'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'error',
};

export function OrderList({ orders, onDelete }: { orders: Order[]; onDelete: (id: string) => void }) {
  if (!orders.length) return <Typography color="text.secondary">No orders yet.</Typography>;

  return (
    <>
      {orders.map((order) => (
        <Accordion key={order.id} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {order.id.slice(0, 8)}…
              </Typography>
              <Chip
                label={order.status}
                size="small"
                color={STATUS_COLOR[order.status]}
              />
              <Typography sx={{ ml: 'auto' }} fontWeight="bold">
                ${Number(order.totalAmount).toFixed(2)}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                    <TableCell align="right">
                      ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
```

- [ ] **Step 3: Create `frontend/src/app/orders/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { Container, Typography, Divider, CircularProgress, Box } from '@mui/material';
import { OrderForm } from '@/components/OrderForm';
import { OrderList } from '@/components/OrderList';
import { api } from '@/lib/api';
import type { Order, Product } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.orders.list(), api.products.list()])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (o: Order) => setOrders((prev) => [o, ...prev]);

  const handleDelete = async (id: string) => {
    await api.orders.remove(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Orders</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <OrderForm products={products} onCreated={handleCreated} />
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Order History</Typography>
          <OrderList orders={orders} onDelete={handleDelete} />
        </>
      )}
    </Container>
  );
}
```

- [ ] **Step 4: Add navigation to `frontend/src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { ThemeRegistry } from '@/components/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Microservice App',
  description: 'Product & Order management with dynamic forms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AppBar position="static">
            <Toolbar>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button color="inherit" component={Link} href="/">Products</Button>
                <Button color="inherit" component={Link} href="/orders">Orders</Button>
                <Button color="inherit" component={Link} href="/form-demo">Form Demo</Button>
              </Box>
            </Toolbar>
          </AppBar>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
```

Note: `AppBar` and `Toolbar` are MUI server components that work without `'use client'` here because ThemeRegistry handles the context boundary. If you see hydration errors, add `'use client'` at the top of layout.tsx.

- [ ] **Step 5: Test the full flow**

With both NestJS services and Next.js dev server running:
1. Go to `http://localhost:3000` → create a product (e.g., Widget, $24.99, stock 5)
2. Go to `http://localhost:3000/orders` → place an order for qty 2
3. Verify order appears with `productName: Widget`, `totalAmount: 49.98`
4. Go back to Products → verify Widget stock is now 3

- [ ] **Step 6: Commit**

```bash
git add frontend/src/
git commit -m "feat: add orders page with order form, order list, and nav bar"
```

---

### Task 11: Dynamic Form Demo Page

**Files:**
- Create: `frontend/src/components/DynamicField.tsx`
- Create: `frontend/src/app/form-demo/page.tsx`

**Interfaces:**
- Consumes: `FieldConfig` type, `formConfig` from `lib/formConfig.ts`

- [ ] **Step 1: Create `frontend/src/components/DynamicField.tsx`**

```tsx
'use client';
import {
  Controller,
  Control,
  RegisterOptions,
} from 'react-hook-form';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormHelperText,
  Box,
} from '@mui/material';
import type { FieldConfig } from '@/types';

interface Props {
  field: FieldConfig;
  control: Control<Record<string, string>>;
}

export function DynamicField({ field, control }: Props) {
  const fieldName = String(field.id);
  const rules: RegisterOptions = {
    required: field.required ? `${field.name} is required` : false,
    ...(field.minLength && {
      minLength: { value: field.minLength, message: `Minimum ${field.minLength} characters` },
    }),
    ...(field.maxLength && {
      maxLength: { value: field.maxLength, message: `Maximum ${field.maxLength} characters` },
    }),
  };

  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={field.defaultValue ?? ''}
      rules={rules}
      render={({ field: f, fieldState }) => {
        if (field.fieldType === 'TEXT') {
          return (
            <TextField
              {...f}
              label={field.name}
              fullWidth
              required={field.required}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              inputProps={{ minLength: field.minLength, maxLength: field.maxLength }}
            />
          );
        }

        if (field.fieldType === 'LIST') {
          return (
            <FormControl fullWidth required={field.required} error={!!fieldState.error}>
              <InputLabel>{field.name}</InputLabel>
              <Select {...f} label={field.name}>
                {field.listOfValues1?.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
              {fieldState.error && (
                <FormHelperText>{fieldState.error.message}</FormHelperText>
              )}
            </FormControl>
          );
        }

        if (field.fieldType === 'RADIO') {
          return (
            <FormControl required={field.required} error={!!fieldState.error}>
              <FormLabel>{field.name}</FormLabel>
              <RadioGroup {...f} row>
                {field.listOfValues1?.map((opt) => (
                  <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                ))}
              </RadioGroup>
              {fieldState.error && (
                <FormHelperText>{fieldState.error.message}</FormHelperText>
              )}
            </FormControl>
          );
        }

        return null;
      }}
    />
  );
}
```

- [ ] **Step 2: Create `frontend/src/app/form-demo/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Container, Typography, Button, Stack, Alert,
  Paper, Box, Divider, List, ListItem, ListItemText,
} from '@mui/material';
import { DynamicField } from '@/components/DynamicField';
import { formConfig } from '@/lib/formConfig';

const STORAGE_KEY = 'form_demo_submissions';

export default function FormDemoPage() {
  const { control, handleSubmit, reset } = useForm<Record<string, string>>();
  const [submissions, setSubmissions] = useState<Record<string, string>[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSubmissions(JSON.parse(stored));
  }, []);

  const onSubmit = (values: Record<string, string>) => {
    const next = [values, ...submissions];
    setSubmissions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Signup Form Demo</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fields are driven by the JSON config in <code>lib/formConfig.ts</code>.
        Change <code>fieldType</code> from TEXT → LIST → RADIO to see them swap.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {formConfig.map((field) => (
              <DynamicField key={field.id} field={field} control={control} />
            ))}
            {submitted && <Alert severity="success">Saved to localStorage!</Alert>}
            <Button type="submit" variant="contained" size="large">Submit</Button>
          </Stack>
        </Box>
      </Paper>

      {submissions.length > 0 && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>Past Submissions</Typography>
          <List dense>
            {submissions.map((sub, i) => (
              <Paper key={i} sx={{ mb: 1 }}>
                <ListItem>
                  <ListItemText
                    primary={formConfig.map((f) => `${f.name}: ${sub[f.id] ?? '—'}`).join(' · ')}
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        </>
      )}
    </Container>
  );
}
```

- [ ] **Step 3: Test the dynamic form**

With Next.js dev server running, open `http://localhost:3000/form-demo`.

Verify:
- Full Name and Email render as `<TextField>`
- Gender renders as a `<Select>` dropdown with Male/Female/Others
- "Love React?" renders as radio buttons Yes/No
- Submitting without filling required fields shows validation messages
- After valid submit, data appears in "Past Submissions" below the form
- Refresh the page — past submissions persist (localStorage)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/
git commit -m "feat: add DynamicField component and JSON-driven form demo page"
```

---

### Task 12: README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup steps and API reference"
```

---

## Self-Review Against Spec

**Spec requirement → Task coverage:**

| Requirement | Task |
|-------------|------|
| NestJS project with microservices capabilities | Task 1 |
| Product management microservice | Tasks 2–4 |
| Order management microservice | Tasks 5–6 |
| Schema covers maximum scenarios | Tasks 2, 5 (uuid PK, stock, price snapshot, status enum) |
| CRUD for both services | Tasks 3, 6 |
| Inter-service TCP communication | Tasks 4, 6 |
| Create product → create order with that product | Task 6 (smoke test step) |
| GET orders showing products | Task 6 (`enrichOrder`) |
| Next.js + TypeScript responsive UI | Task 7 |
| Signup form with Full Name, Email, Gender | Task 11 |
| react-hook-form validation | Tasks 9, 11 |
| Fields dynamic based on JSON | Task 11 (DynamicField) |
| TEXT → LIST → RADIO swap | Task 11 |
| MUI styling | Tasks 7–11 |
| localStorage persistence for form | Task 11 |
| README with local run steps | Task 12 |

No gaps found. All spec requirements are covered.
