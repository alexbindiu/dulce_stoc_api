import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsInt,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Category } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Numele produsului este obligatoriu.' })
  @MinLength(2, { message: 'Minim 2 caractere.' })
  @MaxLength(100, { message: 'Maxim 100 de caractere.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsEnum(Category, { message: 'Categorie invalidă.' })
  category: Category;

  @Type(() => Number)
  @IsNumber({}, { message: 'Prețul este obligatoriu.' })
  @Min(0, { message: 'Prețul nu poate fi negativ.' })
  @Max(100_000, { message: 'Maxim 100.000 lei.' })
  pricePerUnit: number;

  @Type(() => Number)
  @IsInt({ message: 'Stocul trebuie să fie întreg.' })
  @Min(0, { message: 'Stocul nu poate fi negativ.' })
  @Max(100_000, { message: 'Maxim 100.000 bucăți.' })
  stock: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Maxim 500 de caractere.' })
  description?: string = '';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true, message: 'Fiecare ingredient max 80 caractere.' })
  @ArrayMaxSize(50, { message: 'Maxim 50 de ingrediente.' })
  ingredients?: string[] = [];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean = true;
}
