import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StatisticsService } from './statistics.service';

@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  async getSummary(@CurrentUser() user: { id: string }) {
    return this.statisticsService.getSummary(user.id);
  }
}