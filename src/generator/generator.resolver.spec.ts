import { Test } from '@nestjs/testing';
import { GeneratorResolver } from './generator.resolver';
import { GeneratorService } from './generator.service';
import { PUB_SUB } from '../pubsub.module';

describe('GeneratorResolver', () => {
  it('resolves generator logic', async () => {
    const mockService = { getStatus: jest.fn(), start: jest.fn(), stop: jest.fn() };
    const mockUser = { id: 'test-user' };
    const module = await Test.createTestingModule({
      providers: [
        GeneratorResolver,
        { provide: GeneratorService, useValue: mockService },
        { provide: PUB_SUB, useValue: { asyncIterator: jest.fn() } }
      ],
    }).compile();
    
    const resolver = module.get(GeneratorResolver);
    resolver.generatorStatus(mockUser); expect(mockService.getStatus).toHaveBeenCalled();
    resolver.startGenerator(mockUser, 3, 1000); expect(mockService.start).toHaveBeenCalledWith('test-user', 3, 1000);
    resolver.stopGenerator(mockUser); expect(mockService.stop).toHaveBeenCalled();
  });
});