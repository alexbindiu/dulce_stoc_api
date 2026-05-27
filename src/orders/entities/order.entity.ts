import { Field, Float, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING', CONFIRMED = 'CONFIRMED', COMPLETED = 'COMPLETED', CANCELLED = 'CANCELLED',
}
registerEnumType(OrderStatus, { name: 'OrderStatus', description: 'Lifecycle status of a customer order' });

@ObjectType()
@Entity('orders') // Mapare tabelă SQL
export class Order {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  // Relația către User (rezolvă eroarea ta)
  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field() @Column() customerName: string;
  @Field({ nullable: true }) @Column({ nullable: true }) customerPhone?: string;
  @Field({ nullable: true }) @Column({ nullable: true }) notes?: string;
  @Field(() => OrderStatus) @Column({ type: 'varchar', default: OrderStatus.PENDING }) status: OrderStatus;
  
  // Relația către itemele din comandă
  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Field(() => Float) @Column('float') totalValue: number;
  @Field(() => Int) @Column('int') totalItems: number;
  
  @Field() @CreateDateColumn() createdAt: string;
  @Field() @UpdateDateColumn() updatedAt: string;
}

@ObjectType()
export class OrdersPage {
  @Field(() => [Order]) data: Order[];
  @Field(() => Int) total: number;
  @Field(() => Int) page: number;
  @Field(() => Int) pageSize: number;
  @Field(() => Int) totalPages: number;
  @Field() hasNextPage: boolean;
}