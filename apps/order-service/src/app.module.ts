import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order/order.entity';
import { OrderItem } from './order/order-item.entity';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // ponytail: TypeORM v1.0.0 types don't include 'better-sqlite3'; runtime supports it
      type: 'better-sqlite3' as any,
      database: 'orders.db',
      entities: [Order, OrderItem],
      synchronize: true,
    }),
    OrderModule,
  ],
})
export class AppModule {}
