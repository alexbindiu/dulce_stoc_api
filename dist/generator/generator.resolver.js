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
exports.GeneratorResolver = exports.GeneratorStatusGql = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const pubsub_module_1 = require("../pubsub.module");
const generator_service_1 = require("./generator.service");
let GeneratorStatusGql = class GeneratorStatusGql {
};
exports.GeneratorStatusGql = GeneratorStatusGql;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], GeneratorStatusGql.prototype, "running", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], GeneratorStatusGql.prototype, "batchSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], GeneratorStatusGql.prototype, "intervalMs", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], GeneratorStatusGql.prototype, "totalGenerated", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], GeneratorStatusGql.prototype, "startedAt", void 0);
exports.GeneratorStatusGql = GeneratorStatusGql = __decorate([
    (0, graphql_1.ObjectType)()
], GeneratorStatusGql);
let GeneratorResolver = class GeneratorResolver {
    constructor(generatorService, pubSub) {
        this.generatorService = generatorService;
        this.pubSub = pubSub;
    }
    generatorStatus(user) {
        return this.generatorService.getStatus(user.id);
    }
    startGenerator(user, batchSize, intervalMs) {
        return this.generatorService.start(user.id, batchSize ?? 3, intervalMs ?? 4000);
    }
    stopGenerator(user) {
        return this.generatorService.stop(user.id);
    }
    generatorStatusChanged() {
        return this.pubSub.asyncIterator(pubsub_module_1.EVENTS.GENERATOR_STATUS_CHANGED);
    }
};
exports.GeneratorResolver = GeneratorResolver;
__decorate([
    (0, graphql_1.Query)(() => GeneratorStatusGql),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", GeneratorStatusGql)
], GeneratorResolver.prototype, "generatorStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => GeneratorStatusGql),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('batchSize', { type: () => graphql_1.Int, nullable: true })),
    __param(2, (0, graphql_1.Args)('intervalMs', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", GeneratorStatusGql)
], GeneratorResolver.prototype, "startGenerator", null);
__decorate([
    (0, graphql_1.Mutation)(() => GeneratorStatusGql),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", GeneratorStatusGql)
], GeneratorResolver.prototype, "stopGenerator", null);
__decorate([
    (0, graphql_1.Subscription)(() => GeneratorStatusGql, { resolve: (payload) => payload[pubsub_module_1.EVENTS.GENERATOR_STATUS_CHANGED] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GeneratorResolver.prototype, "generatorStatusChanged", null);
exports.GeneratorResolver = GeneratorResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(1, (0, common_1.Inject)(pubsub_module_1.PUB_SUB)),
    __metadata("design:paramtypes", [generator_service_1.GeneratorService, graphql_subscriptions_1.PubSub])
], GeneratorResolver);
//# sourceMappingURL=generator.resolver.js.map