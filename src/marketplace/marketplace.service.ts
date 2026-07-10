import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { BusinessProfile } from './dto/business-profile.type';
import { RescueDeal } from './dto/rescue-deal.type';

// Un "business" = un cont care NU este vizitator (businessName != 'N/A')
const NOT_CLIENT = 'N/A';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
  ) {}

  async getCities(): Promise<string[]> {
    const rows = await this.userRepo
      .createQueryBuilder('u')
      .select('DISTINCT u.county', 'county')
      .where('u.businessName != :na', { na: NOT_CLIENT })
      .orderBy('u.county', 'ASC')
      .getRawMany();
    return rows.map((r) => r.county).filter(Boolean);
  }

  async getBusinesses(city?: string): Promise<BusinessProfile[]> {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .where('u.businessName != :na', { na: NOT_CLIENT });
    if (city) qb.andWhere('u.county = :city', { city });
    const users = await qb.orderBy('u.businessName', 'ASC').getMany();

    const counts = await this.productCounts(users.map((u) => u.id));
    return users.map((u) => this.toProfile(u, counts.get(u.id) ?? 0));
  }

  async getBusiness(id: string): Promise<BusinessProfile> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user || user.businessName === NOT_CLIENT) {
      throw new NotFoundException('Afacerea nu a fost găsită.');
    }
    const counts = await this.productCounts([id]);
    return this.toProfile(user, counts.get(id) ?? 0);
  }

  async getBusinessProducts(businessId: string): Promise<Product[]> {
    return this.productRepo.find({
      where: { userId: businessId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Dulce Rescue: produse active cu reducere (aproape de expirare).
  // În ultimele 24h înainte de expirare, produsul devine GRATIS.
  async getRescueDeals(city?: string): Promise<RescueDeal[]> {
    const FREE_WINDOW_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    const products = await this.productRepo.find({
      where: { isActive: true, discountPercent: MoreThan(0) },
    });
    if (products.length === 0) return [];

    const userIds = [...new Set(products.map((p) => p.userId))];
    const users = await this.userRepo.find({ where: { id: In(userIds) } });
    const byId = new Map(users.map((u) => [u.id, u]));

    let deals = products
      .map((p) => {
        const u = byId.get(p.userId);
        if (!u || u.businessName === NOT_CLIENT) return null;
        const dp = p.discountPercent ?? 0;
        const target = p.expiryDate ? new Date(`${p.expiryDate}T23:59:59`).getTime() : null;
        const free = target !== null && target - now <= FREE_WINDOW_MS;
        const finalPrice = free ? 0 : Math.round(p.pricePerUnit * (1 - dp / 100) * 100) / 100;
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          originalPrice: p.pricePerUnit,
          finalPrice,
          discountPercent: dp,
          free,
          expiryDate: p.expiryDate,
          stock: p.stock,
          businessId: u.id,
          businessName: u.businessName,
          businessType: u.businessType,
          county: u.county,
        } as RescueDeal;
      })
      .filter((d): d is RescueDeal => d !== null);

    if (city) deals = deals.filter((d) => d.county === city);
    // Cele care expiră cel mai curând, primele.
    deals.sort((a, b) => (a.expiryDate ?? '9999').localeCompare(b.expiryDate ?? '9999'));
    return deals;
  }

  // Numărul de produse active per afacere, într-un singur query (evită N+1)
  private async productCounts(businessIds: string[]): Promise<Map<string, number>> {
    if (businessIds.length === 0) return new Map();
    const rows = await this.productRepo
      .createQueryBuilder('p')
      .select('p.userId', 'userId')
      .addSelect('COUNT(*)', 'cnt')
      .where('p.isActive = :a', { a: true })
      .andWhere('p.userId IN (:...ids)', { ids: businessIds })
      .groupBy('p.userId')
      .getRawMany();
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.userId, Number(r.cnt));
    return map;
  }

  private toProfile(u: User, productCount: number): BusinessProfile {
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      businessName: u.businessName,
      businessType: u.businessType,
      county: u.county,
      phone: u.phone,
      description: u.description,
      productionScale: u.productionScale,
      dietaryOptions: u.dietaryOptions,
      specialties: u.specialties,
      productCount,
    };
  }
}
