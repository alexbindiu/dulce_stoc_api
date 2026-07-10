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
import { MarketplaceModule } from './marketplace/marketplace.module';
import { AiModule } from './ai/ai.module';
import { SeedModule } from './seed/seed.module';
import { AppController } from './app.controller';

// MongoDB (chat) e OPȚIONAL: se activează doar dacă există MONGO_URI.
// Fără el, aplicația pornește normal — doar chat-ul este dezactivat.
const chatImports = process.env.MONGO_URI
  ? [MongooseModule.forRoot(process.env.MONGO_URI), ChatModule]
  : [];

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
    ...chatImports,
    MarketplaceModule,
    AiModule,
    SeedModule,
  ],
  controllers: [AppController],
})
export class AppModule {}