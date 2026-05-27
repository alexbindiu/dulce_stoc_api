import { Args, Field, Int, Mutation, ObjectType, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PUB_SUB, EVENTS } from '../pubsub.module';
import { GeneratorService } from './generator.service';

@ObjectType()
export class GeneratorStatusGql {
  @Field() running: boolean;
  @Field(() => Int) batchSize: number;
  @Field(() => Int) intervalMs: number;
  @Field(() => Int) totalGenerated: number;
  @Field({ nullable: true }) startedAt: string | null;
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class GeneratorResolver {
  constructor(private readonly generatorService: GeneratorService, @Inject(PUB_SUB) private readonly pubSub: PubSub) {}

  @Query(() => GeneratorStatusGql)
  generatorStatus(@CurrentUser() user: { id: string }): GeneratorStatusGql {
    return this.generatorService.getStatus(user.id);
  }

  @Mutation(() => GeneratorStatusGql)
  startGenerator(@CurrentUser() user: { id: string }, @Args('batchSize', { type: () => Int, nullable: true }) batchSize: number, @Args('intervalMs', { type: () => Int, nullable: true }) intervalMs: number): GeneratorStatusGql {
    return this.generatorService.start(user.id, batchSize ?? 3, intervalMs ?? 4000);
  }

  @Mutation(() => GeneratorStatusGql)
  stopGenerator(@CurrentUser() user: { id: string }): GeneratorStatusGql {
    return this.generatorService.stop(user.id);
  }

  @Subscription(() => GeneratorStatusGql, { resolve: (payload) => payload[EVENTS.GENERATOR_STATUS_CHANGED] })
  generatorStatusChanged() {
    return this.pubSub.asyncIterator(EVENTS.GENERATOR_STATUS_CHANGED);
  }
}