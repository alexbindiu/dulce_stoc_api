"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const products_module_1 = require("../products/products.module");
const generator_controller_1 = require("./generator.controller");
const generator_gateway_1 = require("./generator.gateway");
const generator_service_1 = require("./generator.service");
const generator_resolver_1 = require("./generator.resolver");
let GeneratorModule = class GeneratorModule {
};
exports.GeneratorModule = GeneratorModule;
exports.GeneratorModule = GeneratorModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, products_module_1.ProductsModule],
        controllers: [generator_controller_1.GeneratorController],
        providers: [generator_gateway_1.GeneratorGateway, generator_service_1.GeneratorService, generator_resolver_1.GeneratorResolver],
    })
], GeneratorModule);
//# sourceMappingURL=generator.module.js.map