import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  action: string; 
  // Vom avea acțiuni de genul: 'MANAGE_OWN_BUSINESS', 'VIEW_ALL_BUSINESSES'
}