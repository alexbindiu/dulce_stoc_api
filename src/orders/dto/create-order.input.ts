import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

@InputType()
export class CreateOrderItemInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Product ID este obligatoriu.' })
  @IsString()
  productId: string;

  @Field(() => Int)
  @IsInt({ message: 'Cantitatea trebuie să fie un număr întreg.' })
  @Min(1, { message: 'Cantitatea minimă este 1.' })
  @Max(10_000, { message: 'Cantitatea maximă este 10.000.' })
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Numele clientului este obligatoriu.' })
  @MaxLength(100, { message: 'Maxim 100 de caractere.' })
  customerName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Maxim 20 de caractere.' })
  customerPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Maxim 500 de caractere.' })
  notes?: string;

  @Field(() => OrderStatus, { nullable: true, defaultValue: OrderStatus.PENDING })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @Field(() => [CreateOrderItemInput])
  @IsArray()
  @ArrayMinSize(1, { message: 'Comanda trebuie să aibă cel puțin un produs.' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemInput)
  items: CreateOrderItemInput[];
}
