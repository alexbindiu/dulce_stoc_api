import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { ProductsService } from '../products/products.service';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Category } from '../products/entities/product.entity';

const USER_ID = 'test-user';

describe('OrdersService', () => {
  let service: OrdersService;

  // Mock-uri pentru repository-urile TypeORM
  const mockOrderRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((order) => Promise.resolve({ id: 'order-1', ...order })),
    findAndCount: jest.fn().mockResolvedValue([
      [{ id: 'order-1', userId: USER_ID, status: OrderStatus.PENDING, items: [], totalValue: 0, totalItems: 0 }], 
      1
    ]),
    findOne: jest.fn().mockResolvedValue({ 
      id: 'order-1', userId: USER_ID, status: OrderStatus.PENDING, items: [], totalValue: 0, totalItems: 0 
    }),
    find: jest.fn().mockResolvedValue([]),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockOrderItemRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((item) => Promise.resolve({ id: 'item-1', ...item })),
    findOne: jest.fn().mockResolvedValue({ 
      id: 'item-1', orderId: 'order-1', order: { userId: USER_ID, items: [] }, quantity: 1, unitPrice: 10, subtotal: 10 
    }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockProductsService = {
    findOne: jest.fn().mockResolvedValue({ 
      id: 'prod-1', name: 'Test Product', pricePerUnit: 10, category: Category.Tort 
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: ProductsService, useValue: mockProductsService },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemRepo },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks(); // Curățăm istoricul mock-urilor între teste
  });

  it('creates an order correctly', async () => {
    const order = await service.create(USER_ID, { customerName: 'Ion', items: [{ productId: 'prod-1', quantity: 2 }] });
    expect(order.customerName).toBe('Ion');
    expect(mockOrderRepo.save).toHaveBeenCalled();
    expect(mockOrderItemRepo.save).toHaveBeenCalled();
  });

  it('findAll returns paginated orders', async () => {
    const res = await service.findAll(USER_ID, { page: 1, pageSize: 10 });
    expect(res.total).toBe(1);
    expect(mockOrderRepo.findAndCount).toHaveBeenCalled();
  });

  it('findOne returns order', async () => {
    const order = await service.findOne(USER_ID, 'order-1');
    expect(order.id).toBe('order-1');
    expect(mockOrderRepo.findOne).toHaveBeenCalled();
  });

  it('update modifies order status', async () => {
    const updated = await service.update(USER_ID, 'order-1', { status: OrderStatus.CONFIRMED });
    expect(mockOrderRepo.save).toHaveBeenCalled();
  });

  it('remove deletes the order', async () => {
    await service.remove(USER_ID, 'order-1');
    expect(mockOrderRepo.remove).toHaveBeenCalled();
  });

  it('addItem saves a new order item', async () => {
    await service.addItem(USER_ID, 'order-1', 'prod-1', 1);
    expect(mockOrderItemRepo.save).toHaveBeenCalled();
  });

  it('removeItem deletes an order item', async () => {
    // Falsificăm un item care face parte dintr-o comandă cu mai multe produse
    mockOrderItemRepo.findOne.mockResolvedValueOnce({
      id: 'item-1', orderId: 'order-1', order: { userId: USER_ID, items: [{}, {}] }
    });
    
    await service.removeItem(USER_ID, 'item-1');
    expect(mockOrderItemRepo.remove).toHaveBeenCalled();
  });
});