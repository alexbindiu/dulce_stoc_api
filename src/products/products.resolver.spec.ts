import { Test } from '@nestjs/testing';
import { ProductsResolver } from './products.resolver';
import { ProductsService } from './products.service';
import { PUB_SUB } from '../pubsub.module';

describe('ProductsResolver', () => {
  let resolver: ProductsResolver;
  let service: ProductsService;
  const mockUser = { id: 'test-user' };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsResolver,
        { provide: ProductsService, useValue: { findAll: jest.fn(() => ({ data: [] })), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn(), '_assertPriceDecimals': jest.fn() } },
        { provide: PUB_SUB, useValue: { asyncIterator: jest.fn() } },
      ],
    }).compile();

    resolver = module.get(ProductsResolver);
    service = module.get(ProductsService);
  });

  it('maps GQL calls to service', () => {
    resolver.products(mockUser, {}); expect(service.findAll).toHaveBeenCalled();
    resolver.product(mockUser, '1'); expect(service.findOne).toHaveBeenCalled();
    resolver.createProduct(mockUser, {} as any); expect(service.create).toHaveBeenCalled();
    resolver.updateProduct(mockUser, '1', {} as any); expect(service.update).toHaveBeenCalled();
    resolver.deleteProduct(mockUser, '1'); expect(service.remove).toHaveBeenCalled();
  });
});