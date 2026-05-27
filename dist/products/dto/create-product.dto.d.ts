import { Category } from '../entities/product.entity';
export declare class CreateProductDto {
    name: string;
    category: Category;
    pricePerUnit: number;
    stock: number;
    description?: string;
    ingredients?: string[];
    isActive?: boolean;
}
