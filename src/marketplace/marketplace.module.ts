import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceResolver } from './marketplace.resolver';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User, Product])],
  providers: [MarketplaceService, MarketplaceResolver],
})
export class MarketplaceModule {}
