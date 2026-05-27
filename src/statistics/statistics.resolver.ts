import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StatisticsService, StatisticsSummary } from './statistics.service';

@Resolver()
@UseGuards(GqlAuthGuard)
export class StatisticsResolver {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Query(() => StatisticsSummary)
  async statistics(@CurrentUser() user: { id: string }): Promise<StatisticsSummary> {
    return this.statisticsService.getSummary(user.id);
  }
}