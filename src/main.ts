import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLog } from './auth/entities/audit-log.entity';
import { AuditInterceptor } from './auth/interceptors/audit.interceptor';
import { ObservationList } from './auth/entities/observation-list.entity';

async function bootstrap() {
  // 1. ELIMINĂ citirea certificatelor fs.readFileSync și pornește o aplicație HTTP normală:
  const app = await NestFactory.create(AppModule); // FĂRĂ { httpsOptions } aici!

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

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('DulceStoc API')
    .setDescription('REST + GraphQL backend for patisserie inventory')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Interceptoarele trebuie configurate ÎNAINTE de app.listen
  const auditLogRepo = app.get(getRepositoryToken(AuditLog));
  const obsListRepo = app.get(getRepositoryToken(ObservationList)); 
  app.useGlobalInterceptors(new AuditInterceptor(auditLogRepo, obsListRepo));

  // 2. Ascultă pe portul oferit de Railway și pe host-ul 0.0.0.0
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();