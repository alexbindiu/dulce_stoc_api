import { User } from '../../auth/entities/user.entity';
import { OrderItem } from './order-item.entity';
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class Order {
    id: string;
    userId: string;
    user: User;
    customerName: string;
    customerPhone?: string;
    notes?: string;
    status: OrderStatus;
    items: OrderItem[];
    totalValue: number;
    totalItems: number;
    createdAt: string;
    updatedAt: string;
}
export declare class OrdersPage {
    data: Order[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
}
