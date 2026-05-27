import { OrderStatus } from '../entities/order.entity';
export declare class CreateOrderItemInput {
    productId: string;
    quantity: number;
}
export declare class CreateOrderInput {
    customerName: string;
    customerPhone?: string;
    notes?: string;
    status?: OrderStatus;
    items: CreateOrderItemInput[];
}
