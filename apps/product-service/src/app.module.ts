import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product/product.entity';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // ponytail: TypeORM v1.0.0 types don't include 'better-sqlite3'; runtime supports it
      type: 'better-sqlite3' as any,
      database: 'products.db',
      entities: [Product],
      synchronize: true,
    }),
    ProductModule,
  ],
})
export class AppModule {}
