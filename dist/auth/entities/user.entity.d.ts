import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { Role } from './role.entity';
export declare class User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    businessName: string;
    businessType: string;
    county: string;
    role: Role;
    products?: Product[];
    orders?: Order[];
}
