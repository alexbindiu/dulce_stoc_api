import { Test } from '@nestjs/testing';
import { StatisticsResolver } from './statistics.resolver';
import { StatisticsService } from './statistics.service';

describe('StatisticsResolver', () => {
  it('resolves statistics', async () => {
    const mockService = { getSummary: jest.fn() };
    const mockUser = { id: 'test-user' };
    const module = await Test.createTestingModule({
      providers: [StatisticsResolver, { provide: StatisticsService, useValue: mockService }],
    }).compile();
    
    module.get(StatisticsResolver).statistics(mockUser);
    expect(mockService.getSummary).toHaveBeenCalled();
  });
});