import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Module({
  imports: [
    AuthModule, 
    ProductsModule,
    TypeOrmModule.forFeature([Order, OrderItem]) // <-- Înregistrăm tabelele SQL
  ],
  providers: [OrdersService, OrdersResolver],
  exports: [OrdersService],
})
export class OrdersModule {}