"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const typeorm_1 = require("@nestjs/typeorm");
const audit_log_entity_1 = require("./auth/entities/audit-log.entity");
const audit_interceptor_1 = require("./auth/interceptors/audit.interceptor");
const observation_list_entity_1 = require("./auth/entities/observation-list.entity");
const fs = require("fs");
const path = require("path");
async function bootstrap() {
    const httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, '..', 'server.key')),
        cert: fs.readFileSync(path.join(__dirname, '..', 'server.crt')),
    };
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { httpsOptions });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.enableCors({ origin: '*' });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('DulceStoc API')
        .setDescription('REST + GraphQL backend for patisserie inventory')
        .setVersion('2.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
    const url = `http://localhost:${process.env.PORT ?? 3000}`;
    console.log(`\n🚀 DulceStoc API running`);
    console.log(`   REST:    ${url}/api`);
    console.log(`   GraphQL: ${url}/graphql`);
    console.log(`   Swagger: ${url}/docs\n`);
    const auditLogRepo = app.get((0, typeorm_1.getRepositoryToken)(audit_log_entity_1.AuditLog));
    const obsListRepo = app.get((0, typeorm_1.getRepositoryToken)(observation_list_entity_1.ObservationList));
    app.useGlobalInterceptors(new audit_interceptor_1.AuditInterceptor(auditLogRepo, obsListRepo));
}
bootstrap();
//# sourceMappingURL=main.js.map