import { Field, InputType, Int, ID } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

@InputType()
export class UpdateOrderInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

@InputType()
export class UpdateOrderItemInput {
  @Field(() => Int)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000)
  quantity: number;
}
