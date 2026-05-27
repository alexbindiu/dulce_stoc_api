import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; 

  @ManyToMany(() => Permission, { eager: true }) 
  @JoinTable({ name: 'role_permissions' }) 
  permissions: Permission[];

  // Relație One-to-Many 
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}