import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { Order, OrderStatus, OrdersPage } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput, UpdateOrderItemInput } from './dto/update-order.input';

export interface OrderQueryOptions { page?: number; pageSize?: number; status?: OrderStatus; }

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    private readonly productsService: ProductsService,
  ) {}

  async create(userId: string, dto: CreateOrderInput): Promise<Order> {
    const order = this.orderRepo.create({
      userId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      notes: dto.notes,
      status: dto.status ?? OrderStatus.PENDING,
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

  async findAll(userId: string, opts: OrderQueryOptions = {}): Promise<OrdersPage> {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 10;
    const where: any = { userId };
    if (opts.status) where.status = opts.status;

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['items'], // Aduce automat și item-urile din DB
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' }
    });

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return { data, total, page, pageSize, totalPages, hasNextPage: page < totalPages };
  }

  async findOne(userId: string, id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id, userId }, relations: ['items'] });
    if (!order) throw new NotFoundException(`Comanda nu a fost găsită.`);
    return order;
  }

  async update(userId: string, id: string, dto: UpdateOrderInput): Promise<Order> {
    const order = await this.findOne(userId, id);
    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Nu poți modifica o comandă finalizată sau anulată.');
    }

    Object.assign(order, dto);
    return this.orderRepo.save(order);
  }

  async remove(userId: string, id: string): Promise<void> {
    const order = await this.findOne(userId, id);
    await this.orderRepo.remove(order); // Va șterge și items datorită cascadei din entitate
  }

  async addItem(userId: string, orderId: string, productId: string, quantity: number): Promise<OrderItem> {
    const order = await this.findOne(userId, orderId);
    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Comandă blocată.');
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

  async updateItem(userId: string, itemId: string, dto: UpdateOrderItemInput): Promise<OrderItem> {
    const item = await this.orderItemRepo.findOne({ where: { id: itemId }, relations: ['order'] });
    if (!item) throw new NotFoundException(`Item-ul nu a fost găsit.`);
    if (item.order.userId !== userId) throw new NotFoundException('Comanda nu aparține utilizatorului.');

    item.quantity = dto.quantity;
    item.subtotal = Math.round(dto.quantity * item.unitPrice * 100) / 100;
    const savedItem = await this.orderItemRepo.save(item);
    
    await this._recalculateAndSave(item.orderId);
    return savedItem;
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    const item = await this.orderItemRepo.findOne({ where: { id: itemId }, relations: ['order', 'order.items'] });
    if (!item) throw new NotFoundException(`Item-ul nu a fost găsit.`);
    if (item.order.userId !== userId) throw new NotFoundException('Comanda nu aparține utilizatorului.');
    if (item.order.items.length <= 1) throw new BadRequestException('O comandă trebuie să aibă cel puțin un produs.');

    await this.orderItemRepo.remove(item);
    await this._recalculateAndSave(item.orderId);
  }

  async getStats(userId: string) {
    // Aduce toate comenzile userului cu tot cu produse pt a genera rapoarte
    const allOrders = await this.orderRepo.find({ where: { userId }, relations: ['items', 'items.product'] });
    let totalRevenue = 0;
    const revenueByProduct = new Map<string, any>();

    for (const order of allOrders) {
      if (order.status === OrderStatus.CANCELLED) continue;
      for (const item of order.items) {
        totalRevenue += item.subtotal;
        if (!item.product) continue;
        
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
      pendingOrders: allOrders.filter((o) => o.status === OrderStatus.PENDING).length,
      confirmedOrders: allOrders.filter((o) => o.status === OrderStatus.CONFIRMED).length,
      completedOrders: allOrders.filter((o) => o.status === OrderStatus.COMPLETED).length,
      cancelledOrders: allOrders.filter((o) => o.status === OrderStatus.CANCELLED).length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: allOrders.length > 0 ? Math.round((totalRevenue / allOrders.length) * 100) / 100 : 0,
      revenueByProduct: Array.from(revenueByProduct.values()).sort((a, b) => b.totalRevenue - a.totalRevenue),
    };
  }

  // Recalculează totalurile unei comenzi după ce modificăm un Item
  private async _recalculateAndSave(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId }, relations: ['items'] });
    if (!order) return null;
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
}