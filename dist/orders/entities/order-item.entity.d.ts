import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    order: Order;
    productId: string;
    product?: Product;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}
