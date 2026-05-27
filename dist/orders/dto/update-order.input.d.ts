import { OrderStatus } from '../entities/order.entity';
export declare class UpdateOrderInput {
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    status?: OrderStatus;
}
export declare class UpdateOrderItemInput {
    quantity: number;
}
