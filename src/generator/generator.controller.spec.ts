import { Test } from '@nestjs/testing';
import { GeneratorController } from './generator.controller';
import { GeneratorService } from './generator.service';

describe('GeneratorController', () => {
  let controller: GeneratorController;
  let service: GeneratorService;
  const mockUser = { id: 'test-user' };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [GeneratorController],
      providers: [{ provide: GeneratorService, useValue: { getStatus: jest.fn(), start: jest.fn(), stop: jest.fn() } }],
    }).compile();

    controller = module.get(GeneratorController);
    service = module.get(GeneratorService);
  });

  it('routes generator actions', () => {
    controller.getStatus(mockUser); expect(service.getStatus).toHaveBeenCalled();
    controller.start(mockUser, {}); expect(service.start).toHaveBeenCalled();
    controller.stop(mockUser); expect(service.stop).toHaveBeenCalled();
  });
});