"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const create_product_input_1 = require("./create-product.input");
let UpdateProductInput = class UpdateProductInput extends (0, graphql_1.PartialType)(create_product_input_1.CreateProductInput) {
};
exports.UpdateProductInput = UpdateProductInput;
exports.UpdateProductInput = UpdateProductInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateProductInput);
//# sourceMappingURL=update-product.input.js.map