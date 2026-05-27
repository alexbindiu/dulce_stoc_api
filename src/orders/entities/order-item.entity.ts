import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';

@ObjectType()
@Entity('order_items') // Mapare tabelă SQL
export class OrderItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  orderId: string;

  // Legătura cu comanda mamă
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Field(() => ID)
  @Column()
  productId: string;

  // Legătura cu produsul (folosim SET NULL dacă produsul e șters, să nu se șteargă istoric din comandă)
  @Field(() => Product, { nullable: true })
  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Field(() => Int) @Column('int') quantity: number;
  @Field(() => Float) @Column('float') unitPrice: number;
  @Field(() => Float) @Column('float') subtotal: number;
}