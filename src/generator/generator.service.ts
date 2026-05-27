import { Injectable, Inject } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { PubSub } from 'graphql-subscriptions';
import { ProductsService } from '../products/products.service';
import { GeneratorGateway } from './generator.gateway';
import { PUB_SUB, EVENTS } from '../pubsub.module';
import { Category } from '../products/entities/product.entity';
import { CreateProductDto } from '../products/dto/create-product.dto';

const CATEGORIES = Object.values(Category);
const NAME_TEMPLATES: Record<Category, () => string> = {
  [Category.Tort]:      () => `Tort ${faker.person.firstName()} cu ${faker.helpers.arrayElement(['fructe', 'vanilie', 'mascarpone'])}`,
  [Category.Ecler]:     () => `Ecler cu ${faker.helpers.arrayElement(['ciocolată', 'caramel', 'vanilie'])}`,
  [Category.Croissant]: () => `Croissant ${faker.helpers.arrayElement(['cu unt', 'simplu'])}`,
  [Category.Prajitura]: () => `Prăjitură cu ${faker.helpers.arrayElement(['nucă', 'mere'])}`,
  [Category.Tarta]:     () => `Tartă cu ${faker.helpers.arrayElement(['fructe', 'cremă'])}`,
};

function generateProduct(): CreateProductDto {
  const category = faker.helpers.arrayElement(CATEGORIES);
  const name     = NAME_TEMPLATES[category]();
  return { 
    name, category, pricePerUnit: faker.number.int({ min: 300, max: 19999 }) / 100, 
    stock: faker.number.int({ min: 0, max: 200 }), isActive: faker.datatype.boolean({ probability: 0.85 }), 
    ingredients: [], description: '' 
  };
}

export interface GeneratorStatus { running: boolean; batchSize: number; intervalMs: number; totalGenerated: number; startedAt: string | null; }
interface UserGeneratorState { timer: NodeJS.Timeout; totalGenerated: number; startedAt: string; batchSize: number; intervalMs: number; }

@Injectable()
export class GeneratorService {
  private userGenerators = new Map<string, UserGeneratorState>();

  constructor(
    private readonly productsService: ProductsService,
    private readonly gateway: GeneratorGateway,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  getStatus(userId: string): GeneratorStatus {
    const state = this.userGenerators.get(userId);
    return {
      running: !!state, batchSize: state?.batchSize ?? 3, intervalMs: state?.intervalMs ?? 4000,
      totalGenerated: state?.totalGenerated ?? 0, startedAt: state?.startedAt ?? null,
    };
  }

  start(userId: string, batchSize = 3, intervalMs = 4000): GeneratorStatus {
    if (this.userGenerators.has(userId)) this.stop(userId);

    const safeBatch = Math.min(Math.max(batchSize, 1), 20);
    const safeInterval = Math.min(Math.max(intervalMs, 1000), 30000);

    // Funcția din interiorul setInterval este acum asincronă
    const timer = setInterval(async () => {
      await this._tick(userId);
    }, safeInterval);

    this.userGenerators.set(userId, { timer, totalGenerated: 0, startedAt: new Date().toISOString(), batchSize: safeBatch, intervalMs: safeInterval });
    
    // Rulăm prima dată manual
    this._tick(userId);
    
    this.gateway.broadcastStatus('started', safeInterval, safeBatch);
    this.pubSub.publish(EVENTS.GENERATOR_STATUS_CHANGED, { [EVENTS.GENERATOR_STATUS_CHANGED]: this.getStatus(userId) });
    return this.getStatus(userId);
  }

  stop(userId: string): GeneratorStatus {
    const state = this.userGenerators.get(userId);
    if (state) {
      clearInterval(state.timer);
      this.userGenerators.delete(userId);
    }
    const status = this.getStatus(userId);
    this.gateway.broadcastStatus('stopped', status.intervalMs, status.batchSize);
    this.pubSub.publish(EVENTS.GENERATOR_STATUS_CHANGED, { [EVENTS.GENERATOR_STATUS_CHANGED]: status });
    return status;
  }

  // AM ADAUGAT ASYNC AICI
  private async _tick(userId: string) {
    const state = this.userGenerators.get(userId);
    if (!state) return;

    const newProducts = [];
    for (let i = 0; i < state.batchSize; i++) {
      // AM ADAUGAT AWAIT AICI
      const p = await this.productsService.create(userId, generateProduct());
      newProducts.push(p);
    }
    state.totalGenerated += newProducts.length;

    // AM ADAUGAT AWAIT AICI
    const { total } = await this.productsService.findAll(userId, { page: 1, pageSize: 1 });
    const payload = { products: newProducts, stats: { total, generated: state.totalGenerated } };

    this.gateway.broadcastBatch(newProducts, { total, generated: state.totalGenerated });
    this.pubSub.publish(EVENTS.PRODUCTS_BATCH_ADDED, { [EVENTS.PRODUCTS_BATCH_ADDED]: payload });
  }
}