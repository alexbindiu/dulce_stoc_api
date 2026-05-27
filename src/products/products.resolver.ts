import { Args, ID, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProductsService } from './products.service';
import { Product, ProductsPage } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductQueryInput } from './dto/product-query.input';
import { PUB_SUB, EVENTS } from '../pubsub.module';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
class BatchStats {
  @Field(() => Int) total: number;
  @Field(() => Int) generated: number;
}

@ObjectType()
export class BatchAddedPayloadGql {
  @Field(() => [Product]) products: Product[];
  @Field(() => BatchStats) stats: BatchStats;
}

@Resolver(() => Product)

@UseGuards(GqlAuthGuard, RolesGuard)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub
  ) {}

  @Query(() => ProductsPage)
  async products(@CurrentUser() user: { id: string }, @Args('query', { nullable: true }) query?: ProductQueryInput): Promise<ProductsPage> {
    const q = query ?? {};
    const result = await this.productsService.findAll(user.id, {
      page: q.page ?? 1, pageSize: q.pageSize ?? 12, search: q.search, category: q.category, activeOnly: q.activeOnly,
    });
    return { ...result, hasNextPage: result.page < result.totalPages };
  }

  @Query(() => Product, { nullable: true })
  async product(@CurrentUser() user: { id: string }, @Args('id', { type: () => ID }) id: string): Promise<Product | undefined> {
    return this.productsService.findOne(user.id, id);
  }

  @Mutation(() => Product)
  @Roles('ADMIN')
  async createProduct(@CurrentUser() user: { id: string }, @Args('input') input: CreateProductInput): Promise<Product> {
    this.productsService['_assertPriceDecimals'](input.pricePerUnit);
    return this.productsService.create(user.id, input as any);
  }

  @Mutation(() => Product)
  @Roles('ADMIN') 
  async updateProduct(@CurrentUser() user: { id: string }, @Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateProductInput): Promise<Product> {
    return this.productsService.update(user.id, id, input as any);
  }

  @Mutation(() => Boolean)
  @Roles('ADMIN') 
  async deleteProduct(@CurrentUser() user: { id: string }, @Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.productsService.remove(user.id, id);
    return true;
  }

  @Subscription(() => BatchAddedPayloadGql, { resolve: (payload) => payload[EVENTS.PRODUCTS_BATCH_ADDED] })
  @Roles('ADMIN') 
  productsBatchAdded() {
    return this.pubSub.asyncIterator(EVENTS.PRODUCTS_BATCH_ADDED);
  }
}