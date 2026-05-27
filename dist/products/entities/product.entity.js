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
exports.ProductsPage = exports.Product = exports.Category = void 0;
const graphql_1 = require("@nestjs/graphql");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../auth/entities/user.entity");
var Category;
(function (Category) {
    Category["Tort"] = "Tort";
    Category["Ecler"] = "Ecler";
    Category["Croissant"] = "Croissant";
    Category["Prajitura"] = "Pr\u0103jitur\u0103";
    Category["Tarta"] = "Tart\u0103";
})(Category || (exports.Category = Category = {}));
(0, graphql_1.registerEnumType)(Category, { name: 'Category' });
let Product = class Product {
};
exports.Product = Product;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Product.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.products, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Product.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => Category),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Product.prototype, "pricePerUnit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Product.prototype, "stock", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], Product.prototype, "ingredients", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", String)
], Product.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", String)
], Product.prototype, "updatedAt", void 0);
exports.Product = Product = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('products')
], Product);
let ProductsPage = class ProductsPage {
};
exports.ProductsPage = ProductsPage;
__decorate([
    (0, graphql_1.Field)(() => [Product]),
    __metadata("design:type", Array)
], ProductsPage.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductsPage.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductsPage.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductsPage.prototype, "pageSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductsPage.prototype, "totalPages", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ProductsPage.prototype, "hasNextPage", void 0);
exports.ProductsPage = ProductsPage = __decorate([
    (0, graphql_1.ObjectType)()
], ProductsPage);
//# sourceMappingURL=product.entity.js.map