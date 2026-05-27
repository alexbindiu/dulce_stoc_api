import { Test, TestingModule } from '@nestjs/testing';
import { Category } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { StatisticsService } from './statistics.service';
import { OrdersService } from '../orders/orders.service';

const USER_ID = 'test-user';

describe('StatisticsService', () => {
  let service: StatisticsService;

  // Mock-uim răspunsul asincron pentru ProductsService
  const mockProductsService = {
    findAll: jest.fn().mockResolvedValue({
      data: [
        { id: 'p1', category: Category.Tort, pricePerUnit: 10, stock: 5, isActive: true },
        { id: 'p2', category: Category.Ecler, pricePerUnit: 5, stock: 10, isActive: false }
      ],
      total: 2
    })
  };

  // Mock-uim răspunsul asincron pentru OrdersService
  const mockOrdersService = {
    getStats: jest.fn().mockResolvedValue({
      totalOrders: 10, pendingOrders: 2, confirmedOrders: 3, completedOrders: 5, cancelledOrders: 0, 
      totalRevenue: 500, averageOrderValue: 50, revenueByProduct: []
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: ProductsService, useValue: mockProductsService },
        { provide: OrdersService, useValue: mockOrdersService }
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    jest.clearAllMocks();
  });

  it('computes summary correctly based on mocked async services', async () => {
    const s = await service.getSummary(USER_ID);
    
    // Verificăm dacă a calculat bine statisticile pe baza datelor mockate
    expect(s.totalProducts).toBe(2);
    expect(s.activeProducts).toBe(1);
    expect(s.inactiveProducts).toBe(1);
    expect(s.totalStockValue).toBe(100); // (10 lei * 5 bucăți) + (5 lei * 10 bucăți) = 100
    
    // Verificăm dacă au fost apelate corect metodele asincrone cu userId-ul
    expect(mockProductsService.findAll).toHaveBeenCalledWith(USER_ID, { page: 1, pageSize: 100_000 });
    expect(mockOrdersService.getStats).toHaveBeenCalledWith(USER_ID);
  });
});