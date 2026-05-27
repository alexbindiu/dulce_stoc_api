import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { ObservationList } from '../entities/observation-list.entity';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm'; // <--- Adăugat


@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog) // <--- Adăugat
    private auditLogRepo: Repository<AuditLog>,
    @InjectRepository(ObservationList) // <--- Adăugat
    private obsListRepo: Repository<ObservationList>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let isAction = false;
    let user = null;
    let actionText = '';
    let detailsText = '';

    // 1. Verificăm dacă e o cerere HTTP (REST)
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      if (request) {
        user = request.user;
        isAction = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method);
        actionText = `${request.method} ${request.url}`;
        detailsText = JSON.stringify(request.body || {}).substring(0, 255);
      }
    } 
    // 2. Verificăm dacă e o cerere GraphQL
    else if (context.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo();
      const req = gqlContext.getContext().req;
      
      if (req) {
        user = req.user;
        // În GraphQL, acțiunile care modifică date se numesc "Mutation"
        isAction = info.parentType.name === 'Mutation'; 
        actionText = `GraphQL Mutation: ${info.fieldName}`;
        detailsText = JSON.stringify(gqlContext.getArgs() || {}).substring(0, 255);
      }
    }

    if (isAction) {
      console.log(`\n--- ${actionText} ---`);
      console.log(`User detectat:`, user ? 'DA' : 'NU');
    }

    return next.handle().pipe(
      tap(async () => {
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

            // Logica STEALTH pentru SPAM
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
          } catch (error) {
            console.error('❌ EROARE CRITICĂ LA SALVARE:', error);
          }
        }
      }),
    );
  }
}