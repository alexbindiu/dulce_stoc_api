import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category, Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';

const VALID_DTO: CreateProductDto = {
  name: 'Ecler Test', category: Category.Ecler, pricePerUnit: 12, stock: 30,
  description: 'Un ecler de test.', ingredients: ['Făină', 'Ouă'], isActive: true,
};
const USER_ID = 'test-user';

describe('ProductsService', () => {
  let service: ProductsService;

  // Cream un mock pentru TypeORM Repository
  const mockProductRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((product) => Promise.resolve({ id: 'uuid-1234', ...product })),
    findAndCount: jest.fn().mockResolvedValue([[ { ...VALID_DTO, id: 'uuid-1234', userId: USER_ID } ], 1]),
    findOne: jest.fn().mockImplementation(({ where }) => {
      if (where.id === 'good-id' && where.userId === USER_ID) {
        return Promise.resolve({ ...VALID_DTO, id: 'good-id', userId: USER_ID });
      }
      return Promise.resolve(null);
    }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepo, // Injectăm mock-ul aici
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks(); // Curățăm apelurile între teste
  });

  describe('create', () => {
    it('returns a product with a generated id and userId', async () => {
      const p = await service.create(USER_ID, VALID_DTO); // Am adăugat await
      expect(p.id).toBeTruthy();
      expect(p.userId).toBe(USER_ID);
      expect(mockProductRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns paginated data from repo', async () => {
      const result = await service.findAll(USER_ID, { page: 1, pageSize: 20 }); // Am adăugat await
      expect(result.total).toBe(1);
      expect(mockProductRepo.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns the correct product', async () => {
      const found = await service.findOne(USER_ID, 'good-id'); // Am adăugat await
      expect(found.id).toBe('good-id');
    });

    it('throws NotFoundException if product not found', async () => {
      await expect(service.findOne(USER_ID, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates product successfully', async () => {
      const updated = await service.update(USER_ID, 'good-id', { name: 'Ecler Updatat' }); // Am adăugat await
      expect(updated.name).toBe('Ecler Updatat');
      expect(mockProductRepo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes the product', async () => {
      await service.remove(USER_ID, 'good-id'); // Am adăugat await
      expect(mockProductRepo.remove).toHaveBeenCalled();
    });
  });
});