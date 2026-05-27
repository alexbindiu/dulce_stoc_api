import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { Order, OrderStatus, OrdersPage } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput, UpdateOrderItemInput } from './dto/update-order.input';
export interface OrderQueryOptions {
    page?: number;
    pageSize?: number;
    status?: OrderStatus;
}
export declare class OrdersService {
    private orderRepo;
    private orderItemRepo;
    private readonly productsService;
    constructor(orderRepo: Repository<Order>, orderItemRepo: Repository<OrderItem>, productsService: ProductsService);
    create(userId: string, dto: CreateOrderInput): Promise<Order>;
    findAll(userId: string, opts?: OrderQueryOptions): Promise<OrdersPage>;
    findOne(userId: string, id: string): Promise<Order>;
    update(userId: string, id: string, dto: UpdateOrderInput): Promise<Order>;
    remove(userId: string, id: string): Promise<void>;
    addItem(userId: string, orderId: string, productId: string, quantity: number): Promise<OrderItem>;
    updateItem(userId: string, itemId: string, dto: UpdateOrderItemInput): Promise<OrderItem>;
    removeItem(userId: string, itemId: string): Promise<void>;
    getStats(userId: string): Promise<{
        totalOrders: number;
        pendingOrders: number;
        confirmedOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        revenueByProduct: any[];
    }>;
    private _recalculateAndSave;
}
