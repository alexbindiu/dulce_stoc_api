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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const products_service_1 = require("../products/products.service");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
let OrdersService = class OrdersService {
    constructor(orderRepo, orderItemRepo, productsService) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.productsService = productsService;
    }
    async create(userId, dto) {
        const order = this.orderRepo.create({
            userId,
            customerName: dto.customerName,
            customerPhone: dto.customerPhone,
            notes: dto.notes,
            status: dto.status ?? order_entity_1.OrderStatus.PENDING,
            totalValue: 0,
            totalItems: 0,
        });
        const savedOrder = await this.orderRepo.save(order);
        let totalValue = 0;
        let totalItems = 0;
        for (const itemInput of dto.items) {
            const product = await this.productsService.findOne(userId, itemInput.productId);
            const subtotal = Math.round(itemInput.quantity * product.pricePerUnit * 100) / 100;
            const item = this.orderItemRepo.create({
                orderId: savedOrder.id,
                productId: product.id,
                quantity: itemInput.quantity,
                unitPrice: product.pricePerUnit,
                subtotal,
            });
            await this.orderItemRepo.save(item);
            totalValue += subtotal;
            totalItems += itemInput.quantity;
        }
        savedOrder.totalValue = Math.round(totalValue * 100) / 100;
        savedOrder.totalItems = totalItems;
        return this.orderRepo.save(savedOrder);
    }
    async findAll(userId, opts = {}) {
        const page = opts.page ?? 1;
        const pageSize = opts.pageSize ?? 10;
        const where = { userId };
        if (opts.status)
            where.status = opts.status;
        const [data, total] = await this.orderRepo.findAndCount({
            where,
            relations: ['items'],
            skip: (page - 1) * pageSize,
            take: pageSize,
            order: { createdAt: 'DESC' }
        });
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        return { data, total, page, pageSize, totalPages, hasNextPage: page < totalPages };
    }
    async findOne(userId, id) {
        const order = await this.orderRepo.findOne({ where: { id, userId }, relations: ['items'] });
        if (!order)
            throw new common_1.NotFoundException(`Comanda nu a fost găsită.`);
        return order;
    }
    async update(userId, id, dto) {
        const order = await this.findOne(userId, id);
        if (order.status === order_entity_1.OrderStatus.COMPLETED || order.status === order_entity_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Nu poți modifica o comandă finalizată sau anulată.');
        }
        Object.assign(order, dto);
        return this.orderRepo.save(order);
    }
    async remove(userId, id) {
        const order = await this.findOne(userId, id);
        await this.orderRepo.remove(order);
    }
    async addItem(userId, orderId, productId, quantity) {
        const order = await this.findOne(userId, orderId);
        if (order.status === order_entity_1.OrderStatus.COMPLETED || order.status === order_entity_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Comandă blocată.');
        }
        const existingItem = order.items.find((i) => i.productId === productId);
        if (existingItem) {
            return this.updateItem(userId, existingItem.id, { quantity: existingItem.quantity + quantity });
        }
        const product = await this.productsService.findOne(userId, productId);
        const subtotal = Math.round(quantity * product.pricePerUnit * 100) / 100;
        const newItem = this.orderItemRepo.create({
            orderId, productId, quantity, unitPrice: product.pricePerUnit, subtotal
        });
        const savedItem = await this.orderItemRepo.save(newItem);
        await this._recalculateAndSave(orderId);
        return savedItem;
    }
    async updateItem(userId, itemId, dto) {
        const item = await this.orderItemRepo.findOne({ where: { id: itemId }, relations: ['order'] });
        if (!item)
            throw new common_1.NotFoundException(`Item-ul nu a fost găsit.`);
        if (item.order.userId !== userId)
            throw new common_1.NotFoundException('Comanda nu aparține utilizatorului.');
        item.quantity = dto.quantity;
        item.subtotal = Math.round(dto.quantity * item.unitPrice * 100) / 100;
        const savedItem = await this.orderItemRepo.save(item);
        await this._recalculateAndSave(item.orderId);
        return savedItem;
    }
    async removeItem(userId, itemId) {
        const item = await this.orderItemRepo.findOne({ where: { id: itemId }, relations: ['order', 'order.items'] });
        if (!item)
            throw new common_1.NotFoundException(`Item-ul nu a fost găsit.`);
        if (item.order.userId !== userId)
            throw new common_1.NotFoundException('Comanda nu aparține utilizatorului.');
        if (item.order.items.length <= 1)
            throw new common_1.BadRequestException('O comandă trebuie să aibă cel puțin un produs.');
        await this.orderItemRepo.remove(item);
        await this._recalculateAndSave(item.orderId);
    }
    async getStats(userId) {
        const allOrders = await this.orderRepo.find({ where: { userId }, relations: ['items', 'items.product'] });
        let totalRevenue = 0;
        const revenueByProduct = new Map();
        for (const order of allOrders) {
            if (order.status === order_entity_1.OrderStatus.CANCELLED)
                continue;
            for (const item of order.items) {
                totalRevenue += item.subtotal;
                if (!item.product)
                    continue;
                const existing = revenueByProduct.get(item.productId) ?? {
                    productId: item.productId, productName: item.product.name, category: item.product.category, totalQuantity: 0, totalRevenue: 0
                };
                revenueByProduct.set(item.productId, {
                    ...existing,
                    totalQuantity: existing.totalQuantity + item.quantity,
                    totalRevenue: Math.round((existing.totalRevenue + item.subtotal) * 100) / 100
                });
            }
        }
        return {
            totalOrders: allOrders.length,
            pendingOrders: allOrders.filter((o) => o.status === order_entity_1.OrderStatus.PENDING).length,
            confirmedOrders: allOrders.filter((o) => o.status === order_entity_1.OrderStatus.CONFIRMED).length,
            completedOrders: allOrders.filter((o) => o.status === order_entity_1.OrderStatus.COMPLETED).length,
            cancelledOrders: allOrders.filter((o) => o.status === order_entity_1.OrderStatus.CANCELLED).length,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            averageOrderValue: allOrders.length > 0 ? Math.round((totalRevenue / allOrders.length) * 100) / 100 : 0,
            revenueByProduct: Array.from(revenueByProduct.values()).sort((a, b) => b.totalRevenue - a.totalRevenue),
        };
    }
    async _recalculateAndSave(orderId) {
        const order = await this.orderRepo.findOne({ where: { id: orderId }, relations: ['items'] });
        if (!order)
            return null;
        let totalValue = 0;
        let totalItems = 0;
        for (const item of order.items) {
            totalValue += item.subtotal;
            totalItems += item.quantity;
        }
        order.totalValue = Math.round(totalValue * 100) / 100;
        order.totalItems = totalItems;
        return this.orderRepo.save(order);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        products_service_1.ProductsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map