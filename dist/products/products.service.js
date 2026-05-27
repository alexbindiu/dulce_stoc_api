"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
let ProductsService = class ProductsService {
    constructor(productRepo) {
        this.productRepo = productRepo;
    }
    async create(userId, dto) {
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
    async findAll(userId, query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 6;
        const where = { userId };
        if (query.activeOnly)
            where.isActive = true;
        if (query.category)
            where.category = query.category;
        if (query.search)
            where.name = (0, typeorm_2.Like)(`%${query.search}%`);
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
    async findOne(userId, id) {
        const product = await this.productRepo.findOne({ where: { id, userId } });
        if (!product)
            throw new common_1.NotFoundException(`Produsul nu a fost găsit.`);
        return product;
    }
    async update(userId, id, dto) {
        const product = await this.findOne(userId, id);
        if (dto.pricePerUnit !== undefined)
            this._assertPriceDecimals(dto.pricePerUnit);
        Object.assign(product, dto);
        return this.productRepo.save(product);
    }
    async remove(userId, id) {
        const product = await this.findOne(userId, id);
        await this.productRepo.remove(product);
    }
    _assertPriceDecimals(price) {
        if (Math.abs(Math.round(price * 100) - price * 100) > 0.0001)
            throw new common_1.BadRequestException('Prețul poate avea maxim 2 zecimale.');
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map