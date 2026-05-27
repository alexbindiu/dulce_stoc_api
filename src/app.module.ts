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

@Module({
  imports: [
    PubSubModule,
    // Configurarea Bazei de Date Relaționale
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(process.cwd(), 'dulcestoc.sqlite'),
      // Folosim glob pattern pentru a încărca entitățile absolut automat
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true, // Creează tabelele automat
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      subscriptions: { 'graphql-ws': true },
      context: ({ req }) => ({ req }),
    }),
    AuthModule,
    ProductsModule,
    StatisticsModule,
    GeneratorModule,
    OrdersModule,
    //MongooseModule.forRoot('mongodb://127.0.0.1:27017/dulcestoc-chat'),
    //ChatModule,
  ],
})
export class AppModule {}