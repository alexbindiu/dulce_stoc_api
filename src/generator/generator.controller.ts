import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GeneratorService } from './generator.service';

@UseGuards(JwtAuthGuard)
@Controller('generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Get('status')
  getStatus(@CurrentUser() user: { id: string }) {
    return this.generatorService.getStatus(user.id);
  }

  @Post('start')
  @HttpCode(HttpStatus.OK)
  start(@CurrentUser() user: { id: string }, @Body() dto: any) {
    return this.generatorService.start(user.id, dto.batchSize, dto.intervalMs);
  }

  @Post('stop')
  @HttpCode(HttpStatus.OK)
  stop(@CurrentUser() user: { id: string }) {
    return this.generatorService.stop(user.id);
  }
}