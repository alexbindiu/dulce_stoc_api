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
exports.OrdersResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const orders_service_1 = require("./orders.service");
const order_entity_1 = require("./entities/order.entity");
const create_order_input_1 = require("./dto/create-order.input");
const update_order_input_1 = require("./dto/update-order.input");
let OrdersResolver = class OrdersResolver {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async createOrder(user, input) {
        return this.ordersService.create(user.id, input);
    }
    async orders(user) {
        return this.ordersService.findAll(user.id);
    }
    async order(user, id) {
        return this.ordersService.findOne(user.id, id);
    }
    async updateOrder(user, id, input) {
        return this.ordersService.update(user.id, id, input);
    }
    async deleteOrder(user, id) {
        await this.ordersService.remove(user.id, id);
        return true;
    }
};
exports.OrdersResolver = OrdersResolver;
__decorate([
    (0, graphql_1.Mutation)(() => order_entity_1.Order),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_order_input_1.CreateOrderInput]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "createOrder", null);
__decorate([
    (0, graphql_1.Query)(() => [order_entity_1.Order]),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "orders", null);
__decorate([
    (0, graphql_1.Query)(() => order_entity_1.Order),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "order", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_entity_1.Order),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_order_input_1.UpdateOrderInput]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "updateOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "deleteOrder", null);
exports.OrdersResolver = OrdersResolver = __decorate([
    (0, graphql_1.Resolver)(() => order_entity_1.Order),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersResolver);
//# sourceMappingURL=orders.resolver.js.map