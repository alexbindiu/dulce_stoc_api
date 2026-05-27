import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
export interface PaginatedProducts {
    data: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare class ProductsService {
    private productRepo;
    constructor(productRepo: Repository<Product>);
    create(userId: string, dto: CreateProductDto): Promise<Product>;
    findAll(userId: string, query: QueryProductDto): Promise<PaginatedProducts>;
    findOne(userId: string, id: string): Promise<Product>;
    update(userId: string, id: string, dto: UpdateProductDto): Promise<Product>;
    remove(userId: string, id: string): Promise<void>;
    private _assertPriceDecimals;
}
