"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const products_module_1 = require("./products/products.module");
const statistics_module_1 = require("./statistics/statistics.module");
const generator_module_1 = require("./generator/generator.module");
const orders_module_1 = require("./orders/orders.module");
const pubsub_module_1 = require("./pubsub.module");
const mongoose_1 = require("@nestjs/mongoose");
const chat_module_1 = require("./chat/chat.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            pubsub_module_1.PubSubModule,
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: (0, path_1.join)(process.cwd(), 'dulcestoc.sqlite'),
                entities: [(0, path_1.join)(__dirname, '**', '*.entity.{ts,js}')],
                synchronize: true,
            }),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                sortSchema: true,
                subscriptions: { 'graphql-ws': true },
                context: ({ req }) => ({ req }),
            }),
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            statistics_module_1.StatisticsModule,
            generator_module_1.GeneratorModule,
            orders_module_1.OrdersModule,
            mongoose_1.MongooseModule.forRoot('mongodb://127.0.0.1:27017/dulcestoc-chat'),
            chat_module_1.ChatModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map