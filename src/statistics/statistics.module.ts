import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { StatisticsResolver } from './statistics.resolver';

@Module({
  imports: [AuthModule, ProductsModule, OrdersModule],
  controllers: [StatisticsController],
  providers: [StatisticsService, StatisticsResolver],
})
export class StatisticsModule {}
