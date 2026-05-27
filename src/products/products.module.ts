import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { Product } from './entities/product.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Product])], // Înregistrare Repo
  controllers: [ProductsController],
  providers: [ProductsService, ProductsResolver],
  exports: [ProductsService],
})
export class ProductsModule {}