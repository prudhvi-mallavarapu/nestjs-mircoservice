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
  items: [{ id: 'item-1', productId: 'prod-1', productName: 'Widget', productCategory: null, quantity: 2, unitPrice: 24.99, order: null as any }],
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
      .mockReturnValueOnce(of({ success: true, price: 24.99, name: 'Widget', category: null }));
    const result = await service.create({ items: [{ productId: 'prod-1', quantity: 2 }] });
    expect(mockOrderRepo.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockOrderRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });
});
