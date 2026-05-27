import { Test, TestingModule } from '@nestjs/testing';
import { OrdersResolver, OrderItemResolver } from './orders.resolver';
import { OrdersService } from './orders.service';
import { ProductsService } from '../products/products.service';
import { PUB_SUB } from '../pubsub.module';

describe('OrdersResolver', () => {
  let resolver: OrdersResolver;
  const mockUser = { id: 'test-user' };
  const mockOrdersService = {
    findAll: jest.fn(() => ({ data: [] })),
    findOne: jest.fn(() => ({ id: '1' })),
    create: jest.fn(() => ({ id: '1' })),
    update: jest.fn(),
    remove: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersResolver, OrderItemResolver,
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: ProductsService, useValue: {} },
        { provide: PUB_SUB, useValue: { publish: jest.fn(), asyncIterator: jest.fn() } },
      ],
    }).compile();

    resolver = module.get<OrdersResolver>(OrdersResolver);
  });

  it('queries orders', () => {
    resolver.orders(mockUser, 1, 10, null as any);
    expect(mockOrdersService.findAll).toHaveBeenCalled();
  });

  it('mutates orders', async () => {
    await resolver.createOrder(mockUser, { customerName: 'Test', items: [] });
    expect(mockOrdersService.create).toHaveBeenCalled();
  });
});