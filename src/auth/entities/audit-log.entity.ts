import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userEmail: string;

  @Column()
  userRole: string; // [ADMIN/USER] conform cerinței

  @Column()
  action: string; // Ex: 'CREATE_PRODUCT', 'DELETE_ORDER', 'LOGIN'

  @Column({ nullable: true })
  details: string; // Informații extra (ex: ID-ul produsului șters)

  @CreateDateColumn()
  timestamp: Date;
}