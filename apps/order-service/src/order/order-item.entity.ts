import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

const numTransformer = { to: (v: number) => v, from: (v: any) => Number(v) };

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;

  @Column({ type: 'text' })
  productId: string;

  @Column({ type: 'text', default: '' })
  productName: string;

  @Column({ type: 'text', nullable: true })
  productCategory: string | null;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, transformer: numTransformer })
  unitPrice: number;
}
