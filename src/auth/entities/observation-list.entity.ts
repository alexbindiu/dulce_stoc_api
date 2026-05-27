import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('observation_list')
export class ObservationList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userEmail: string;

  @Column()
  reason: string; // Ex: 'Too many unauthorized attempts'

  @Column({ default: 'SUSPICIOUS' })
  status: string;

  @CreateDateColumn()
  detectedAt: Date;
}