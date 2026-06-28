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
    expect(result).toEqual({ success: false, price: 0, name: '', category: null });
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
