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
exports.UpdateOrderItemInput = exports.UpdateOrderInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const order_entity_1 = require("../entities/order.entity");
let UpdateOrderInput = class UpdateOrderInput {
};
exports.UpdateOrderInput = UpdateOrderInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateOrderInput.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], UpdateOrderInput.prototype, "customerPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateOrderInput.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => order_entity_1.OrderStatus, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(order_entity_1.OrderStatus),
    __metadata("design:type", String)
], UpdateOrderInput.prototype, "status", void 0);
exports.UpdateOrderInput = UpdateOrderInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateOrderInput);
let UpdateOrderItemInput = class UpdateOrderItemInput {
};
exports.UpdateOrderItemInput = UpdateOrderItemInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10_000),
    __metadata("design:type", Number)
], UpdateOrderItemInput.prototype, "quantity", void 0);
exports.UpdateOrderItemInput = UpdateOrderItemInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateOrderItemInput);
//# sourceMappingURL=update-order.input.js.map