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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsResolver = exports.BatchAddedPayloadGql = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const products_service_1 = require("./products.service");
const product_entity_1 = require("./entities/product.entity");
const create_product_input_1 = require("./dto/create-product.input");
const update_product_input_1 = require("./dto/update-product.input");
const product_query_input_1 = require("./dto/product-query.input");
const pubsub_module_1 = require("../pubsub.module");
const graphql_2 = require("@nestjs/graphql");
let BatchStats = class BatchStats {
};
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], BatchStats.prototype, "total", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], BatchStats.prototype, "generated", void 0);
BatchStats = __decorate([
    (0, graphql_2.ObjectType)()
], BatchStats);
let BatchAddedPayloadGql = class BatchAddedPayloadGql {
};
exports.BatchAddedPayloadGql = BatchAddedPayloadGql;
__decorate([
    (0, graphql_2.Field)(() => [product_entity_1.Product]),
    __metadata("design:type", Array)
], BatchAddedPayloadGql.prototype, "products", void 0);
__decorate([
    (0, graphql_2.Field)(() => BatchStats),
    __metadata("design:type", BatchStats)
], BatchAddedPayloadGql.prototype, "stats", void 0);
exports.BatchAddedPayloadGql = BatchAddedPayloadGql = __decorate([
    (0, graphql_2.ObjectType)()
], BatchAddedPayloadGql);
let ProductsResolver = class ProductsResolver {
    constructor(productsService, pubSub) {
        this.productsService = productsService;
        this.pubSub = pubSub;
    }
    async products(user, query) {
        const q = query ?? {};
        const result = await this.productsService.findAll(user.id, {
            page: q.page ?? 1, pageSize: q.pageSize ?? 12, search: q.search, category: q.category, activeOnly: q.activeOnly,
        });
        return { ...result, hasNextPage: result.page < result.totalPages };
    }
    async product(user, id) {
        return this.productsService.findOne(user.id, id);
    }
    async createProduct(user, input) {
        this.productsService['_assertPriceDecimals'](input.pricePerUnit);
        return this.productsService.create(user.id, input);
    }
    async updateProduct(user, id, input) {
        return this.productsService.update(user.id, id, input);
    }
    async deleteProduct(user, id) {
        await this.productsService.remove(user.id, id);
        return true;
    }
    productsBatchAdded() {
        return this.pubSub.asyncIterator(pubsub_module_1.EVENTS.PRODUCTS_BATCH_ADDED);
    }
};
exports.ProductsResolver = ProductsResolver;
__decorate([
    (0, graphql_1.Query)(() => product_entity_1.ProductsPage),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('query', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, product_query_input_1.ProductQueryInput]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "products", null);
__decorate([
    (0, graphql_1.Query)(() => product_entity_1.Product, { nullable: true }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "product", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_entity_1.Product),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_product_input_1.CreateProductInput]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "createProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_entity_1.Product),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_product_input_1.UpdateProductInput]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "updateProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "deleteProduct", null);
__decorate([
    (0, graphql_1.Subscription)(() => BatchAddedPayloadGql, { resolve: (payload) => payload[pubsub_module_1.EVENTS.PRODUCTS_BATCH_ADDED] }),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsResolver.prototype, "productsBatchAdded", null);
exports.ProductsResolver = ProductsResolver = __decorate([
    (0, graphql_1.Resolver)(() => product_entity_1.Product),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, roles_guard_1.RolesGuard),
    __param(1, (0, common_1.Inject)(pubsub_module_1.PUB_SUB)),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        graphql_subscriptions_1.PubSub])
], ProductsResolver);
//# sourceMappingURL=products.resolver.js.map