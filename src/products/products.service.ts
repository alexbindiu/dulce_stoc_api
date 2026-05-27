import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

export interface PaginatedProducts {
  data: Product[]; total: number; page: number; pageSize: number; totalPages: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(userId: string, dto: CreateProductDto): Promise<Product> {
    this._assertPriceDecimals(dto.pricePerUnit);
    const product = this.productRepo.create({
      ...dto,
      userId,
      description: dto.description ?? '',
      ingredients: dto.ingredients ?? [],
      isActive: dto.isActive ?? true,
    });
    return this.productRepo.save(product);
  }

  async findAll(userId: string, query: QueryProductDto): Promise<PaginatedProducts> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 6;
    
    // Construim filtrele pentru SQL
    const where: any = { userId };
    if (query.activeOnly) where.isActive = true;
    if (query.category) where.category = query.category;
    if (query.search) where.name = Like(`%${query.search}%`);

    const [data, total] = await this.productRepo.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' }
    });

    return {
      data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findOne(userId: string, id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id, userId } });
    if (!product) throw new NotFoundException(`Produsul nu a fost găsit.`);
    return product;
  }

  async update(userId: string, id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(userId, id);
    if (dto.pricePerUnit !== undefined) this._assertPriceDecimals(dto.pricePerUnit);
    
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(userId: string, id: string): Promise<void> {
    const product = await this.findOne(userId, id);
    await this.productRepo.remove(product);
  }

  private _assertPriceDecimals(price: number): void {
    if (Math.abs(Math.round(price * 100) - price * 100) > 0.0001) throw new BadRequestException('Prețul poate avea maxim 2 zecimale.');
  }
}