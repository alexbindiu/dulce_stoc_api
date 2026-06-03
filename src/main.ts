import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLog } from './auth/entities/audit-log.entity';
import { AuditInterceptor } from './auth/interceptors/audit.interceptor';
import { ObservationList } from './auth/entities/observation-list.entity';

async function bootstrap() {
  // 1. Create a standard HTTP app (Render handles HTTPS for you)
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({ origin: '*' });

  // Swagger for REST endpoints
  const config = new DocumentBuilder()
    .setTitle('DulceStoc API')
    .setDescription('REST + GraphQL backend for patisserie inventory')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 2. Bind to 0.0.0.0 and use Render's dynamic PORT
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  
  const url = `http://localhost:${process.env.PORT ?? 3000}`;
  console.log(`\n🚀 DulceStoc API running`);
  console.log(`   REST:    ${url}/api`);
  console.log(`   GraphQL: ${url}/graphql`);
  console.log(`   Swagger: ${url}/docs\n`);

  const auditLogRepo = app.get(getRepositoryToken(AuditLog));
  const obsListRepo = app.get(getRepositoryToken(ObservationList)); 
  app.useGlobalInterceptors(new AuditInterceptor(auditLogRepo, obsListRepo));
}
bootstrap();