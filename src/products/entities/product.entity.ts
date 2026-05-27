import { Field, Float, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum Category {
  Tort = 'Tort', Ecler = 'Ecler', Croissant = 'Croissant', Prajitura = 'Prăjitură', Tarta = 'Tartă'
}
registerEnumType(Category, { name: 'Category' });

@ObjectType()
@Entity('products') // Mapare tabelă DB
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field() @Column() name: string;
  @Field(() => Category) @Column() category: Category;
  @Field(() => Float) @Column('float') pricePerUnit: number;
  @Field(() => Int) @Column('int') stock: number;
  @Field() @Column() description: string;
  
  @Field(() => [String]) 
  @Column('simple-array') // Va fi salvat ca text în SQLite
  ingredients: string[];

  @Field() @Column({ default: true }) isActive: boolean;
  @Field() @CreateDateColumn() createdAt: string;
  @Field() @UpdateDateColumn() updatedAt: string;
} 

@ObjectType()
export class ProductsPage {
  @Field(() => [Product])
  data: Product[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;
}