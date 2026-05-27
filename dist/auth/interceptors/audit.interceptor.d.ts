import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { ObservationList } from '../entities/observation-list.entity';
export declare class AuditInterceptor implements NestInterceptor {
    private auditLogRepo;
    private obsListRepo;
    constructor(auditLogRepo: Repository<AuditLog>, obsListRepo: Repository<ObservationList>);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
