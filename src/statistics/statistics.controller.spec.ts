import { Test } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;
  const mockUser = { id: 'test-user' };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [{ provide: StatisticsService, useValue: { getSummary: jest.fn() } }],
    }).compile();

    controller = module.get(StatisticsController);
    service = module.get(StatisticsService);
  });

  it('routes getSummary', () => {
    controller.getSummary(mockUser);
    expect(service.getSummary).toHaveBeenCalled();
  });
});