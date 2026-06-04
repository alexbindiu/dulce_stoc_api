import { join } from 'path';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { StatisticsModule } from './statistics/statistics.module';
import { GeneratorModule } from './generator/generator.module';
import { OrdersModule } from './orders/orders.module';
import { PubSubModule } from './pubsub.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PubSubModule,
    // Configurarea Bazei de Date Relaționale
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH ?? join(process.cwd(), 'dulcestoc.sqlite'),
      // Folosim glob pattern pentru a încărca entitățile absolut automat
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true, // Creează tabelele automat
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // <--- SCHIMBĂ AICI! 'true' generează schema în memorie și elimină dependența de folderul /src
      sortSchema: true,
      subscriptions: { 'graphql-ws': true },
      context: ({ req }) => ({ req }),
    }),
    AuthModule,
    ProductsModule,
    StatisticsModule,
    GeneratorModule,
    OrdersModule,
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://mongo:wUZfwgAqTmvFkpuPVuJQJxgfOqVyAqds@mongodb.railway.internal:27017/railway?authSource=admin'),
    ChatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}