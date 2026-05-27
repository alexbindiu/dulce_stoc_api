import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(user: {
        id: string;
    }, dto: CreateProductDto): Promise<import("./entities/product.entity").Product>;
    findAll(user: {
        id: string;
    }, query: QueryProductDto): Promise<import("./products.service").PaginatedProducts>;
    findOne(user: {
        id: string;
    }, id: string): Promise<import("./entities/product.entity").Product>;
    update(user: {
        id: string;
    }, id: string, dto: UpdateProductDto): Promise<import("./entities/product.entity").Product>;
    remove(user: {
        id: string;
    }, id: string): Promise<void>;
}
