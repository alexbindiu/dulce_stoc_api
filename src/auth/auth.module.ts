import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JWT_EXPIRES_IN, JWT_SECRET } from './auth.constants';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { AuditLog } from './entities/audit-log.entity';
import { ObservationList } from './entities/observation-list.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Module({
  imports: [
    // 1. Entitățile noastre pentru baza de date
    TypeOrmModule.forFeature([User, Role, Permission, AuditLog, ObservationList]), 
    
    // 2. Modulul de Passport (Asta lipsea / genera eroarea!)
    PassportModule.register({ defaultStrategy: 'jwt' }), 

    // 3. Modulul de JWT (probabil îl aveai deja)
    JwtModule.register({
      secret: JWT_SECRET, 
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    }
  ],
  exports: [AuthService, PassportModule, JwtModule], // Exportăm ca să le poată folosi și alte module
})
export class AuthModule {}