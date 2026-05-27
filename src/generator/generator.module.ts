import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { GeneratorController } from './generator.controller';
import { GeneratorGateway } from './generator.gateway';
import { GeneratorService } from './generator.service';
import { GeneratorResolver } from './generator.resolver';

@Module({
  imports: [AuthModule, ProductsModule],
  controllers: [GeneratorController],
  providers: [GeneratorGateway, GeneratorService, GeneratorResolver],
})
export class GeneratorModule {}
