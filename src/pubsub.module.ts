import { Module, Global } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

export const PUB_SUB = 'PUB_SUB';

export const EVENTS = {
  PRODUCTS_BATCH_ADDED: 'productsBatchAdded',
  GENERATOR_STATUS_CHANGED: 'generatorStatusChanged',
  ORDER_CREATED: 'orderCreated',
  ORDER_UPDATED: 'orderUpdated',
  ORDER_DELETED: 'orderDeleted',
};

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useValue: new PubSub(),
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}
