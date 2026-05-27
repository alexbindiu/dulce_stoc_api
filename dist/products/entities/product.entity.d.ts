import { User } from '../../auth/entities/user.entity';
export declare enum Category {
    Tort = "Tort",
    Ecler = "Ecler",
    Croissant = "Croissant",
    Prajitura = "Pr\u0103jitur\u0103",
    Tarta = "Tart\u0103"
}
export declare class Product {
    id: string;
    userId: string;
    user: User;
    name: string;
    category: Category;
    pricePerUnit: number;
    stock: number;
    description: string;
    ingredients: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare class ProductsPage {
    data: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
}
