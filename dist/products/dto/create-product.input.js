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
exports.CreateProductInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const product_entity_1 = require("../entities/product.entity");
let CreateProductInput = class CreateProductInput {
};
exports.CreateProductInput = CreateProductInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Numele produsului este obligatoriu.' }),
    (0, class_validator_1.MinLength)(2, { message: 'Minim 2 caractere.' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Maxim 100 de caractere.' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], CreateProductInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => product_entity_1.Category),
    (0, class_validator_1.IsEnum)(product_entity_1.Category, { message: 'Categorie invalidă.' }),
    __metadata("design:type", String)
], CreateProductInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Prețul este obligatoriu.' }),
    (0, class_validator_1.Min)(0, { message: 'Prețul nu poate fi negativ.' }),
    (0, class_validator_1.Max)(100_000, { message: 'Maxim 100.000 lei.' }),
    __metadata("design:type", Number)
], CreateProductInput.prototype, "pricePerUnit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Stocul trebuie să fie întreg.' }),
    (0, class_validator_1.Min)(0, { message: 'Stocul nu poate fi negativ.' }),
    (0, class_validator_1.Max)(100_000, { message: 'Maxim 100.000 bucăți.' }),
    __metadata("design:type", Number)
], CreateProductInput.prototype, "stock", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: '' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, { message: 'Maxim 500 de caractere.' }),
    __metadata("design:type", String)
], CreateProductInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true, defaultValue: [] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(80, { each: true, message: 'Fiecare ingredient max 80 caractere.' }),
    (0, class_validator_1.ArrayMaxSize)(50, { message: 'Maxim 50 de ingrediente.' }),
    __metadata("design:type", Array)
], CreateProductInput.prototype, "ingredients", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductInput.prototype, "isActive", void 0);
exports.CreateProductInput = CreateProductInput = __decorate([
    (0, graphql_1.InputType)()
], CreateProductInput);
//# sourceMappingURL=create-product.input.js.map