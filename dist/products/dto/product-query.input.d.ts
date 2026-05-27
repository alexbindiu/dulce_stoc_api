import { Category } from '../entities/product.entity';
export declare class ProductQueryInput {
    search?: string;
    category?: Category;
    activeOnly?: boolean;
    page?: number;
    pageSize?: number;
}
