import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { AiService } from './ai.service';
import { AiResolver } from './ai.resolver';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User, Product])],
  providers: [AiService, AiResolver],
})
export class AiModule {}
