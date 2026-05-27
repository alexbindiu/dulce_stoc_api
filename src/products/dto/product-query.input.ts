import { InputType, Field, Int } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Category } from '../entities/product.entity';

@InputType()
export class ProductQueryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Category, { nullable: true })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 12;
}
