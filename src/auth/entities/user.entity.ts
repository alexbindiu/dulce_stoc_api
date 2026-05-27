import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { Role } from './role.entity';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password?: string; // Nu expunem parola în GraphQL! (Fără @Field)

  @Field()
  @Column()
  businessName: string;

  @Field()
  @Column()
  businessType: string;

  @Field()
  @Column()
  county: string;

  // RELAȚIA CU ROLURILE:
  @ManyToOne(() => Role, (role) => role.users, { eager: true, nullable: true })
  role: Role;

  // RELAȚIA CU PRODUSELE:
  @Field(() => [Product], { nullable: 'itemsAndList' })
  @OneToMany(() => Product, (product) => product.user)
  products?: Product[];

  // RELAȚIA CU COMENZILE:
  @Field(() => [Order], { nullable: 'itemsAndList' })
  @OneToMany(() => Order, (order) => order.user)
  orders?: Order[];
}