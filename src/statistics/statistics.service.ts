import { Injectable } from '@nestjs/common';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { Category } from '../products/entities/product.entity';



@ObjectType()
export class CategoryStat {
  @Field(() => Category) category: Category;
  @Field(() => Int) count: number;
  @Field(() => Int) totalStock: number;
  @Field(() => Float) totalValue: number;
}

@ObjectType()
export class ProductRevenue {
  @Field() productId: string;
  @Field() productName: string;
  @Field() category: string;
  @Field(() => Int) totalQuantity: number;
  @Field(() => Float) totalRevenue: number;
}

@ObjectType()
export class OrderStats {
  @Field(() => Int) totalOrders: number;
  @Field(() => Int) pendingOrders: number;
  @Field(() => Int) confirmedOrders: number;
  @Field(() => Int) completedOrders: number;
  @Field(() => Int) cancelledOrders: number;
  @Field(() => Float) totalRevenue: number;
  @Field(() => Float) averageOrderValue: number;
  @Field(() => [ProductRevenue]) revenueByProduct: ProductRevenue[];
}

@ObjectType()
export class StatisticsSummary {
  @Field(() => Int) totalProducts: number;
  @Field(() => Int) activeProducts: number;
  @Field(() => Int) inactiveProducts: number;
  @Field(() => Int) outOfStockProducts: number;
  @Field(() => Int) totalStock: number;
  @Field(() => Float) totalStockValue: number;
  @Field(() => Float) averagePrice: number;
  @Field(() => [CategoryStat]) byCategory: CategoryStat[];
  @Field(() => OrderStats) orders: OrderStats;
}

@Injectable()
export class StatisticsService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
  ) {}

  async getSummary(userId: string): Promise<StatisticsSummary> {
    // Punem await aici
    const { data: products } = await this.productsService.findAll(userId, { page: 1, pageSize: 100_000 });

    const totalProducts     = products.length;
    const activeProducts    = products.filter((p) => p.isActive).length;
    const inactiveProducts  = totalProducts - activeProducts;
    const outOfStockProducts = products.filter((p) => p.stock === 0).length;
    const totalStock        = products.reduce((s, p) => s + p.stock, 0);
    const totalStockValue   = parseFloat(products.reduce((s, p) => s + p.stock * p.pricePerUnit, 0).toFixed(2));
    const averagePrice      = totalProducts > 0 ? parseFloat((products.reduce((s, p) => s + p.pricePerUnit, 0) / totalProducts).toFixed(2)) : 0;

    const catMap = new Map<Category, CategoryStat>();
    for (const p of products) {
      const existing = catMap.get(p.category) ?? { category: p.category, count: 0, totalStock: 0, totalValue: 0 };
      catMap.set(p.category, {
        ...existing, count: existing.count + 1, totalStock: existing.totalStock + p.stock, totalValue: existing.totalValue + p.stock * p.pricePerUnit,
      });
    }

    return {
      totalProducts, activeProducts, inactiveProducts, outOfStockProducts, totalStock, totalStockValue, averagePrice,
      byCategory: Array.from(catMap.values()),
      orders: await this.ordersService.getStats(userId), // Punem await aici
    };
  }
}