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
exports.OrdersPage = exports.Order = exports.OrderStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../auth/entities/user.entity");
const order_item_entity_1 = require("./order-item.entity");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
(0, graphql_1.registerEnumType)(OrderStatus, { name: 'OrderStatus', description: 'Lifecycle status of a customer order' });
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.orders, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Order.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "customerPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => OrderStatus),
    (0, typeorm_1.Column)({ type: 'varchar', default: OrderStatus.PENDING }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => [order_item_entity_1.OrderItem]),
    (0, typeorm_1.OneToMany)(() => order_item_entity_1.OrderItem, (item) => item.order, { cascade: true }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Order.prototype, "totalValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Order.prototype, "totalItems", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", String)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", String)
], Order.prototype, "updatedAt", void 0);
exports.Order = Order = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('orders')
], Order);
let OrdersPage = class OrdersPage {
};
exports.OrdersPage = OrdersPage;
__decorate([
    (0, graphql_1.Field)(() => [Order]),
    __metadata("design:type", Array)
], OrdersPage.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrdersPage.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrdersPage.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrdersPage.prototype, "pageSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrdersPage.prototype, "totalPages", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], OrdersPage.prototype, "hasNextPage", void 0);
exports.OrdersPage = OrdersPage = __decorate([
    (0, graphql_1.ObjectType)()
], OrdersPage);
//# sourceMappingURL=order.entity.js.map