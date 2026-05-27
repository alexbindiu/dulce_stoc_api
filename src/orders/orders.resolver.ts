import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';

@Resolver(() => Order)
@UseGuards(GqlAuthGuard, RolesGuard)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => Order)
  // Oricine e logat (ADMIN sau NORMAL_USER) poate plasa o comandă
  async createOrder(@CurrentUser() user: { id: string }, @Args('input') input: CreateOrderInput) {
    return this.ordersService.create(user.id, input);
  }

  @Query(() => [Order])
  // Oricine își poate vizualiza comenzile (restricționarea pe user se face în Service)
  async orders(@CurrentUser() user: { id: string }) {
    return this.ordersService.findAll(user.id);
  }

  @Query(() => Order)
  // Oricine își poate vedea o anumită comandă
  async order(@CurrentUser() user: { id: string }, @Args('id', { type: () => ID }) id: string) {
    return this.ordersService.findOne(user.id, id);
  }

  @Mutation(() => Order)
  @Roles('ADMIN') // Doar patiseria (Admin) poate actualiza statusul comenzii
  async updateOrder(@CurrentUser() user: { id: string }, @Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateOrderInput) {
    return this.ordersService.update(user.id, id, input);
  }

  @Mutation(() => Boolean)
  @Roles('ADMIN') // Doar adminul poate anula/șterge din baza de date
  async deleteOrder(@CurrentUser() user: { id: string }, @Args('id', { type: () => ID }) id: string) {
    await this.ordersService.remove(user.id, id);
    return true;
  }
}