import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Message, MessageSchema } from '../chat/schemas/message.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Product, Order, OrderItem]),
    // Modelul de mesaje (chat) doar dacă MongoDB e configurat.
    ...(process.env.MONGO_URI
      ? [MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])]
      : []),
  ],
  providers: [SeedService],
})
export class SeedModule {}
