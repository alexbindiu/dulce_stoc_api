import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
export declare class OrdersResolver {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(user: {
        id: string;
    }, input: CreateOrderInput): Promise<Order>;
    orders(user: {
        id: string;
    }): Promise<import("./entities/order.entity").OrdersPage>;
    order(user: {
        id: string;
    }, id: string): Promise<Order>;
    updateOrder(user: {
        id: string;
    }, id: string, input: UpdateOrderInput): Promise<Order>;
    deleteOrder(user: {
        id: string;
    }, id: string): Promise<boolean>;
}
