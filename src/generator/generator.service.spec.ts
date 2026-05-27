import { Test, TestingModule } from '@nestjs/testing';
import { GeneratorService } from './generator.service';
import { GeneratorGateway } from './generator.gateway';
import { ProductsService } from '../products/products.service';
import { PUB_SUB } from '../pubsub.module';

const mockGateway = {
  broadcastBatch: jest.fn(),
  broadcastStatus: jest.fn(),
};

const USER_ID = 'test-user';

// Funcție ajutătoare pentru a aștepta executarea completă a tuturor promisiunilor dintr-un loop
const flushPromises = async () => {
  for (let i = 0; i < 20; i++) {
    await Promise.resolve();
  }
};

describe('GeneratorService', () => {
  let service: GeneratorService;

  const mockProductsService = {
    create: jest.fn().mockResolvedValue({ 
      id: 'mock-id', name: 'Mock Product', pricePerUnit: 10, stock: 5, category: 'Tort' 
    }),
    findAll: jest.fn().mockResolvedValue({ 
      data: [], total: 10 
    }),
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratorService,
        { provide: ProductsService, useValue: mockProductsService },
        { provide: GeneratorGateway, useValue: mockGateway },
        { provide: PUB_SUB, useValue: { publish: jest.fn(), asyncIterator: jest.fn() } },
      ],
    }).compile();

    service = module.get<GeneratorService>(GeneratorService);
  });

  afterEach(() => {
    if (service) service.stop(USER_ID);
    jest.useRealTimers();
  });

  describe('getStatus', () => {
    it('returns running: false initially', () => {
      expect(service.getStatus(USER_ID).running).toBe(false);
    });
  });

  describe('start', () => {
    it('sets running to true', () => {
      service.start(USER_ID, 2, 2000);
      expect(service.getStatus(USER_ID).running).toBe(true);
    });

    it('generates batchSize products on first tick asynchronously', async () => {
      service.start(USER_ID, 4, 5000);
      
      await flushPromises(); // Așteptăm să se termine toată bucla
      
      expect(mockProductsService.create).toHaveBeenCalledTimes(4);
      expect(service.getStatus(USER_ID).totalGenerated).toBe(4);
    });

    it('increments totalGenerated correctly over multiple async ticks', async () => {
      service.start(USER_ID, 3, 2000);
      await flushPromises();

      jest.advanceTimersByTime(2000);
      await flushPromises();

      jest.advanceTimersByTime(2000);
      await flushPromises();

      expect(service.getStatus(USER_ID).totalGenerated).toBe(9);
      expect(mockProductsService.create).toHaveBeenCalledTimes(9);
    });
  });

  describe('stop', () => {
    it('sets running to false', () => {
      service.start(USER_ID, 2, 2000);
      service.stop(USER_ID);
      expect(service.getStatus(USER_ID).running).toBe(false);
    });

    it('stops the interval - no more ticks after stop', async () => {
      service.start(USER_ID, 2, 2000);
      await flushPromises();
      
      service.stop(USER_ID);
      mockProductsService.create.mockClear();
      
      jest.advanceTimersByTime(10000);
      await flushPromises();
      
      expect(mockProductsService.create).not.toHaveBeenCalled();
    });
  });
});