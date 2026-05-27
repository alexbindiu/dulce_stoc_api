"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsService = exports.StatisticsSummary = exports.OrderStats = exports.ProductRevenue = exports.CategoryStat = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const products_service_1 = require("../products/products.service");
const orders_service_1 = require("../orders/orders.service");
const product_entity_1 = require("../products/entities/product.entity");
let CategoryStat = class CategoryStat {
};
exports.CategoryStat = CategoryStat;
__decorate([
    (0, graphql_1.Field)(() => product_entity_1.Category),
    __metadata("design:type", String)
], CategoryStat.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CategoryStat.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CategoryStat.prototype, "totalStock", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CategoryStat.prototype, "totalValue", void 0);
exports.CategoryStat = CategoryStat = __decorate([
    (0, graphql_1.ObjectType)()
], CategoryStat);
let ProductRevenue = class ProductRevenue {
};
exports.ProductRevenue = ProductRevenue;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductRevenue.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductRevenue.prototype, "productName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductRevenue.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductRevenue.prototype, "totalQuantity", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductRevenue.prototype, "totalRevenue", void 0);
exports.ProductRevenue = ProductRevenue = __decorate([
    (0, graphql_1.ObjectType)()
], ProductRevenue);
let OrderStats = class OrderStats {
};
exports.OrderStats = OrderStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderStats.prototype, "totalOrders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderStats.prototype, "pendingOrders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderStats.prototype, "confirmedOrders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderStats.prototype, "completedOrders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderStats.prototype, "cancelledOrders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderStats.prototype, "totalRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderStats.prototype, "averageOrderValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => [ProductRevenue]),
    __metadata("design:type", Array)
], OrderStats.prototype, "revenueByProduct", void 0);
exports.OrderStats = OrderStats = __decorate([
    (0, graphql_1.ObjectType)()
], OrderStats);
let StatisticsSummary = class StatisticsSummary {
};
exports.StatisticsSummary = StatisticsSummary;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], StatisticsSummary.prototype, "totalProducts", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], StatisticsSummary.prototype, "activeProducts", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], StatisticsSummary.prototype, "inactiveProducts", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], StatisticsSummary.prototype, "outOfStockProducts", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], StatisticsSummary.prototype, "totalStock", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], StatisticsSummary.prototype, "totalStockValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], StatisticsSummary.prototype, "averagePrice", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CategoryStat]),
    __metadata("design:type", Array)
], StatisticsSummary.prototype, "byCategory", void 0);
__decorate([
    (0, graphql_1.Field)(() => OrderStats),
    __metadata("design:type", OrderStats)
], StatisticsSummary.prototype, "orders", void 0);
exports.StatisticsSummary = StatisticsSummary = __decorate([
    (0, graphql_1.ObjectType)()
], StatisticsSummary);
let StatisticsService = class StatisticsService {
    constructor(productsService, ordersService) {
        this.productsService = productsService;
        this.ordersService = ordersService;
    }
    async getSummary(userId) {
        const { data: products } = await this.productsService.findAll(userId, { page: 1, pageSize: 100_000 });
        const totalProducts = products.length;
        const activeProducts = products.filter((p) => p.isActive).length;
        const inactiveProducts = totalProducts - activeProducts;
        const outOfStockProducts = products.filter((p) => p.stock === 0).length;
        const totalStock = products.reduce((s, p) => s + p.stock, 0);
        const totalStockValue = parseFloat(products.reduce((s, p) => s + p.stock * p.pricePerUnit, 0).toFixed(2));
        const averagePrice = totalProducts > 0 ? parseFloat((products.reduce((s, p) => s + p.pricePerUnit, 0) / totalProducts).toFixed(2)) : 0;
        const catMap = new Map();
        for (const p of products) {
            const existing = catMap.get(p.category) ?? { category: p.category, count: 0, totalStock: 0, totalValue: 0 };
            catMap.set(p.category, {
                ...existing, count: existing.count + 1, totalStock: existing.totalStock + p.stock, totalValue: existing.totalValue + p.stock * p.pricePerUnit,
            });
        }
        return {
            totalProducts, activeProducts, inactiveProducts, outOfStockProducts, totalStock, totalStockValue, averagePrice,
            byCategory: Array.from(catMap.values()),
            orders: await this.ordersService.getStats(userId),
        };
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        orders_service_1.OrdersService])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map