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
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Product ${id} not found`);
  }

  async releaseStock(id: string, quantity: number): Promise<void> {
    await this.repo.increment({ id }, 'stock', quantity);
  }

  // Atomic: check stock and decrement in one SQLite transaction.
  // SQLite serializes writes so no row-level lock needed.
  async reserveStock(id: string, quantity: number): Promise<{ success: boolean; price: number; name: string; category: string | null }> {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, { where: { id } });
      if (!product || product.stock < quantity) {
        return { success: false, price: 0, name: '', category: null };
      }
      await manager.update(Product, id, { stock: product.stock - quantity });
      return { success: true, price: product.price, name: product.name, category: product.category ?? null };
    });
  }
}
