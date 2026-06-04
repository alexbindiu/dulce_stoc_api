import { Resolver, Query, Mutation, Args, ID, Int, Subscription } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { Order, OrdersPage, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { PUB_SUB, EVENTS } from '../pubsub.module';

@Resolver(() => Order)
@UseGuards(GqlAuthGuard, RolesGuard)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => Order)
  // Oricine e logat (ADMIN sau NORMAL_USER) poate plasa o comandă
  async createOrder(@CurrentUser() user: { id: string }, @Args('input') input: CreateOrderInput) {
    const order = await this.ordersService.create(user.id, input);
    await this.pubSub.publish(EVENTS.ORDER_CREATED, { [EVENTS.ORDER_CREATED]: order });
    return order;
  }

  @Query(() => OrdersPage)
  // Listă paginată; restricționarea pe user se face în Service
  async orders(
    @CurrentUser() user: { id: string },
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize?: number,
    @Args('status', { type: () => OrderStatus, nullable: true }) status?: OrderStatus,
  ): Promise<OrdersPage> {
    return this.ordersService.findAll(user.id, { page, pageSize, status });
  }

  @Query(() => Order)
  // Oricine își poate vedea o anumită comandă
  async order(@CurrentUser() user: { id: string }, @Args('id', { type: () => ID }) id: string) {
    return this.ordersService.findOne(user.id, id);
  }

  @Mutation(() => Order)
  @Roles('ADMIN') // Doar patiseria (Admin) poate actualiza comanda
  async updateOrder(@CurrentUser() user: { id: string }, @Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateOrderInput) {
    const order = await this.ordersService.update(user.id, id, input);
    await this.pubSub.publish(EVENTS.ORDER_UPDATED, { [EVENTS.ORDER_UPDATED]: order });
    return order;
  }

  @Mutation(() => Boolean)
  @Roles('ADMIN') // Doar adminul poate anula/șterge din baza de date
  async deleteOrder(@CurrentUser() user: { id: string }, @Args('id', { type: () => ID }) id: string) {
    await this.ordersService.remove(user.id, id);
    await this.pubSub.publish(EVENTS.ORDER_DELETED, { [EVENTS.ORDER_DELETED]: { id } });
    return true;
  }

  // ── Operații pe item-urile unei comenzi ─────────────────────────────────────
  @Mutation(() => OrderItem)
  @Roles('ADMIN')
  async addOrderItem(
    @CurrentUser() user: { id: string },
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('productId', { type: () => ID }) productId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ) {
    const item = await this.ordersService.addItem(user.id, orderId, productId, quantity);
    const order = await this.ordersService.findOne(user.id, orderId);
    await this.pubSub.publish(EVENTS.ORDER_UPDATED, { [EVENTS.ORDER_UPDATED]: order });
    return item;
  }

  @Mutation(() => OrderItem)
  @Roles('ADMIN')
  async updateOrderItem(
    @CurrentUser() user: { id: string },
    @Args('itemId', { type: () => ID }) itemId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ) {
    return this.ordersService.updateItem(user.id, itemId, { quantity });
  }

  @Mutation(() => Boolean)
  @Roles('ADMIN')
  async removeOrderItem(
    @CurrentUser() user: { id: string },
    @Args('itemId', { type: () => ID }) itemId: string,
  ) {
    await this.ordersService.removeItem(user.id, itemId);
    return true;
  }

  // ── Subscriptions live ──────────────────────────────────────────────────────
  @Subscription(() => Order, { resolve: (payload) => payload[EVENTS.ORDER_CREATED] })
  orderCreated() {
    return this.pubSub.asyncIterator(EVENTS.ORDER_CREATED);
  }

  @Subscription(() => Order, { resolve: (payload) => payload[EVENTS.ORDER_UPDATED] })
  orderUpdated() {
    return this.pubSub.asyncIterator(EVENTS.ORDER_UPDATED);
  }

  @Subscription(() => Order, { resolve: (payload) => payload[EVENTS.ORDER_DELETED] })
  orderDeleted() {
    return this.pubSub.asyncIterator(EVENTS.ORDER_DELETED);
  }
}
