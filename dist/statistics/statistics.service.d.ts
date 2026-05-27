import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { Category } from '../products/entities/product.entity';
export declare class CategoryStat {
    category: Category;
    count: number;
    totalStock: number;
    totalValue: number;
}
export declare class ProductRevenue {
    productId: string;
    productName: string;
    category: string;
    totalQuantity: number;
    totalRevenue: number;
}
export declare class OrderStats {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    revenueByProduct: ProductRevenue[];
}
export declare class StatisticsSummary {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    outOfStockProducts: number;
    totalStock: number;
    totalStockValue: number;
    averagePrice: number;
    byCategory: CategoryStat[];
    orders: OrderStats;
}
export declare class StatisticsService {
    private readonly productsService;
    private readonly ordersService;
    constructor(productsService: ProductsService, ordersService: OrdersService);
    getSummary(userId: string): Promise<StatisticsSummary>;
}
