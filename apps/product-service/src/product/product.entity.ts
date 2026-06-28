import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

const numTransformer = { to: (v: number) => v, from: (v: any) => Number(v) };

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2, transformer: numTransformer })
  price: number;

  @Column('int')
  stock: number;

  @Column({ type: 'text', nullable: true })
  category?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
