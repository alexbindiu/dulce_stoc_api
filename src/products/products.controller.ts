import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: { id: string }, @Query() query: QueryProductDto) {
    return this.productsService.findAll(user.id, query);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.productsService.findOne(user.id, id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.productsService.remove(user.id, id);
  }
}