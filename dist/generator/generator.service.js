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
exports.GeneratorService = void 0;
const common_1 = require("@nestjs/common");
const faker_1 = require("@faker-js/faker");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const products_service_1 = require("../products/products.service");
const generator_gateway_1 = require("./generator.gateway");
const pubsub_module_1 = require("../pubsub.module");
const product_entity_1 = require("../products/entities/product.entity");
const CATEGORIES = Object.values(product_entity_1.Category);
const NAME_TEMPLATES = {
    [product_entity_1.Category.Tort]: () => `Tort ${faker_1.faker.person.firstName()} cu ${faker_1.faker.helpers.arrayElement(['fructe', 'vanilie', 'mascarpone'])}`,
    [product_entity_1.Category.Ecler]: () => `Ecler cu ${faker_1.faker.helpers.arrayElement(['ciocolată', 'caramel', 'vanilie'])}`,
    [product_entity_1.Category.Croissant]: () => `Croissant ${faker_1.faker.helpers.arrayElement(['cu unt', 'simplu'])}`,
    [product_entity_1.Category.Prajitura]: () => `Prăjitură cu ${faker_1.faker.helpers.arrayElement(['nucă', 'mere'])}`,
    [product_entity_1.Category.Tarta]: () => `Tartă cu ${faker_1.faker.helpers.arrayElement(['fructe', 'cremă'])}`,
};
function generateProduct() {
    const category = faker_1.faker.helpers.arrayElement(CATEGORIES);
    const name = NAME_TEMPLATES[category]();
    return {
        name, category, pricePerUnit: faker_1.faker.number.int({ min: 300, max: 19999 }) / 100,
        stock: faker_1.faker.number.int({ min: 0, max: 200 }), isActive: faker_1.faker.datatype.boolean({ probability: 0.85 }),
        ingredients: [], description: ''
    };
}
let GeneratorService = class GeneratorService {
    constructor(productsService, gateway, pubSub) {
        this.productsService = productsService;
        this.gateway = gateway;
        this.pubSub = pubSub;
        this.userGenerators = new Map();
    }
    getStatus(userId) {
        const state = this.userGenerators.get(userId);
        return {
            running: !!state, batchSize: state?.batchSize ?? 3, intervalMs: state?.intervalMs ?? 4000,
            totalGenerated: state?.totalGenerated ?? 0, startedAt: state?.startedAt ?? null,
        };
    }
    start(userId, batchSize = 3, intervalMs = 4000) {
        if (this.userGenerators.has(userId))
            this.stop(userId);
        const safeBatch = Math.min(Math.max(batchSize, 1), 20);
        const safeInterval = Math.min(Math.max(intervalMs, 1000), 30000);
        const timer = setInterval(async () => {
            await this._tick(userId);
        }, safeInterval);
        this.userGenerators.set(userId, { timer, totalGenerated: 0, startedAt: new Date().toISOString(), batchSize: safeBatch, intervalMs: safeInterval });
        this._tick(userId);
        this.gateway.broadcastStatus('started', safeInterval, safeBatch);
        this.pubSub.publish(pubsub_module_1.EVENTS.GENERATOR_STATUS_CHANGED, { [pubsub_module_1.EVENTS.GENERATOR_STATUS_CHANGED]: this.getStatus(userId) });
        return this.getStatus(userId);
    }
    stop(userId) {
        const state = this.userGenerators.get(userId);
        if (state) {
            clearInterval(state.timer);
            this.userGenerators.delete(userId);
        }
        const status = this.getStatus(userId);
        this.gateway.broadcastStatus('stopped', status.intervalMs, status.batchSize);
        this.pubSub.publish(pubsub_module_1.EVENTS.GENERATOR_STATUS_CHANGED, { [pubsub_module_1.EVENTS.GENERATOR_STATUS_CHANGED]: status });
        return status;
    }
    async _tick(userId) {
        const state = this.userGenerators.get(userId);
        if (!state)
            return;
        const newProducts = [];
        for (let i = 0; i < state.batchSize; i++) {
            const p = await this.productsService.create(userId, generateProduct());
            newProducts.push(p);
        }
        state.totalGenerated += newProducts.length;
        const { total } = await this.productsService.findAll(userId, { page: 1, pageSize: 1 });
        const payload = { products: newProducts, stats: { total, generated: state.totalGenerated } };
        this.gateway.broadcastBatch(newProducts, { total, generated: state.totalGenerated });
        this.pubSub.publish(pubsub_module_1.EVENTS.PRODUCTS_BATCH_ADDED, { [pubsub_module_1.EVENTS.PRODUCTS_BATCH_ADDED]: payload });
    }
};
exports.GeneratorService = GeneratorService;
exports.GeneratorService = GeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(pubsub_module_1.PUB_SUB)),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        generator_gateway_1.GeneratorGateway,
        graphql_subscriptions_1.PubSub])
], GeneratorService);
//# sourceMappingURL=generator.service.js.map