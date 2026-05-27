import { Test } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;
  const mockUser = { id: 'test-user' };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ProductsController);
    service = module.get(ProductsService);
  });

  it('routes standard CRUD', () => {
    controller.create(mockUser, {} as any); expect(service.create).toHaveBeenCalled();
    controller.findAll(mockUser, {}); expect(service.findAll).toHaveBeenCalled();
    controller.findOne(mockUser, '1'); expect(service.findOne).toHaveBeenCalled();
    controller.update(mockUser, '1', {}); expect(service.update).toHaveBeenCalled();
    controller.remove(mockUser, '1'); expect(service.remove).toHaveBeenCalled();
  });
});