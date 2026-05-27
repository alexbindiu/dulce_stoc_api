import { PubSub } from 'graphql-subscriptions';
import { ProductsService } from '../products/products.service';
import { GeneratorGateway } from './generator.gateway';
export interface GeneratorStatus {
    running: boolean;
    batchSize: number;
    intervalMs: number;
    totalGenerated: number;
    startedAt: string | null;
}
export declare class GeneratorService {
    private readonly productsService;
    private readonly gateway;
    private readonly pubSub;
    private userGenerators;
    constructor(productsService: ProductsService, gateway: GeneratorGateway, pubSub: PubSub);
    getStatus(userId: string): GeneratorStatus;
    start(userId: string, batchSize?: number, intervalMs?: number): GeneratorStatus;
    stop(userId: string): GeneratorStatus;
    private _tick;
}
