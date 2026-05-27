import { PubSub } from 'graphql-subscriptions';
import { ProductsService } from './products.service';
import { Product, ProductsPage } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductQueryInput } from './dto/product-query.input';
declare class BatchStats {
    total: number;
    generated: number;
}
export declare class BatchAddedPayloadGql {
    products: Product[];
    stats: BatchStats;
}
export declare class ProductsResolver {
    private readonly productsService;
    private readonly pubSub;
    constructor(productsService: ProductsService, pubSub: PubSub);
    products(user: {
        id: string;
    }, query?: ProductQueryInput): Promise<ProductsPage>;
    product(user: {
        id: string;
    }, id: string): Promise<Product | undefined>;
    createProduct(user: {
        id: string;
    }, input: CreateProductInput): Promise<Product>;
    updateProduct(user: {
        id: string;
    }, id: string, input: UpdateProductInput): Promise<Product>;
    deleteProduct(user: {
        id: string;
    }, id: string): Promise<boolean>;
    productsBatchAdded(): AsyncIterator<unknown, any, any>;
}
export {};
