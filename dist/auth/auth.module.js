"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const auth_constants_1 = require("./auth.constants");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const observation_list_entity_1 = require("./entities/observation-list.entity");
const core_1 = require("@nestjs/core");
const audit_interceptor_1 = require("./interceptors/audit.interceptor");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, audit_log_entity_1.AuditLog, observation_list_entity_1.ObservationList]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: auth_constants_1.JWT_SECRET,
                signOptions: { expiresIn: auth_constants_1.JWT_EXPIRES_IN },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            }
        ],
        exports: [auth_service_1.AuthService, passport_1.PassportModule, jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map