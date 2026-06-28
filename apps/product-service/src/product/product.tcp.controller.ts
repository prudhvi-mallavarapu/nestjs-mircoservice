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
