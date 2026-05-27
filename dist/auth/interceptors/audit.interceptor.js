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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const typeorm_1 = require("typeorm");
const audit_log_entity_1 = require("../entities/audit-log.entity");
const observation_list_entity_1 = require("../entities/observation-list.entity");
const graphql_1 = require("@nestjs/graphql");
const typeorm_2 = require("@nestjs/typeorm");
let AuditInterceptor = class AuditInterceptor {
    constructor(auditLogRepo, obsListRepo) {
        this.auditLogRepo = auditLogRepo;
        this.obsListRepo = obsListRepo;
    }
    intercept(context, next) {
        let isAction = false;
        let user = null;
        let actionText = '';
        let detailsText = '';
        if (context.getType() === 'http') {
            const request = context.switchToHttp().getRequest();
            if (request) {
                user = request.user;
                isAction = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method);
                actionText = `${request.method} ${request.url}`;
                detailsText = JSON.stringify(request.body || {}).substring(0, 255);
            }
        }
        else if (context.getType().toString() === 'graphql') {
            const gqlContext = graphql_1.GqlExecutionContext.create(context);
            const info = gqlContext.getInfo();
            const req = gqlContext.getContext().req;
            if (req) {
                user = req.user;
                isAction = info.parentType.name === 'Mutation';
                actionText = `GraphQL Mutation: ${info.fieldName}`;
                detailsText = JSON.stringify(gqlContext.getArgs() || {}).substring(0, 255);
            }
        }
        if (isAction) {
            console.log(`\n--- ${actionText} ---`);
            console.log(`User detectat:`, user ? 'DA' : 'NU');
        }
        return next.handle().pipe((0, operators_1.tap)(async () => {
            if (isAction && user) {
                try {
                    const userId = user.id || user.sub;
                    const userEmail = user.email;
                    const log = this.auditLogRepo.create({
                        userId: userId,
                        userEmail: userEmail,
                        userRole: user.role?.name || 'USER',
                        action: actionText,
                        details: detailsText,
                    });
                    await this.auditLogRepo.save(log);
                    console.log('✅ LOG SALVAT CU SUCCES IN BAZA DE DATE!');
                    const recentLogs = await this.auditLogRepo.find({
                        where: { userId: userId },
                        order: { timestamp: 'DESC' },
                        take: 6,
                    });
                    if (recentLogs.length === 6) {
                        const oldestOfSix = new Date(recentLogs[5].timestamp).getTime();
                        const oneMinuteAgo = Date.now() - 60 * 1000;
                        if (oldestOfSix > oneMinuteAgo) {
                            const alreadySuspicious = await this.obsListRepo.findOne({ where: { userId: userId } });
                            if (!alreadySuspicious) {
                                const suspect = this.obsListRepo.create({
                                    userId: userId,
                                    userEmail: userEmail,
                                    reason: 'Spam / Activitate prea intensă (>5 acțiuni/minut)',
                                });
                                await this.obsListRepo.save(suspect);
                                console.log('🚨 UTILIZATOR ADAUGAT PE LISTA DE SUSPECTI!');
                            }
                        }
                    }
                }
                catch (error) {
                    console.error('❌ EROARE CRITICĂ LA SALVARE:', error);
                }
            }
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(audit_log_entity_1.AuditLog)),
    __param(1, (0, typeorm_2.InjectRepository)(observation_list_entity_1.ObservationList)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map