import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// All fields optional — PATCH semantics
export class UpdateProductDto extends PartialType(CreateProductDto) {}
