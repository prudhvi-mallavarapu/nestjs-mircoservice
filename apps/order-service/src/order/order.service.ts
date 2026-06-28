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
        this.productClient.send<{ success: boolean; price: number; name: string; category: string | null }>('reserve_stock', {
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
        productName: reservation.name,
        productCategory: reservation.category,
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
    return orders.map((o) => this.enrichOrder(o));
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return this.enrichOrder(order);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    await this.orderRepo.update(id, dto);
    const updated = await this.orderRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException(`Order ${id} not found`);
    return this.enrichOrder(updated);
  }

  async remove(id: string): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    await Promise.all(
      order.items.map((item) =>
        firstValueFrom(
          this.productClient.send('release_stock', { id: item.productId, quantity: item.quantity }),
        ).catch(() => {}), // ponytail: best-effort; product may have been deleted already
      ),
    );
    await this.orderRepo.delete(id);
  }

  private enrichOrder(order: Order) {
    return {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        productName: item.productName,
        productCategory: item.productCategory,
      })),
    };
  }
}
