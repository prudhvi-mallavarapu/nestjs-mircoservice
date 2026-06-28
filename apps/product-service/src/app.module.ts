import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product/product.entity';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'products.db',
      entities: [Product],
      synchronize: true,
    } as any),
    ProductModule,
  ],
})
export class AppModule {}
