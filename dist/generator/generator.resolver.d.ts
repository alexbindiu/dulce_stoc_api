import { PubSub } from 'graphql-subscriptions';
import { GeneratorService } from './generator.service';
export declare class GeneratorStatusGql {
    running: boolean;
    batchSize: number;
    intervalMs: number;
    totalGenerated: number;
    startedAt: string | null;
}
export declare class GeneratorResolver {
    private readonly generatorService;
    private readonly pubSub;
    constructor(generatorService: GeneratorService, pubSub: PubSub);
    generatorStatus(user: {
        id: string;
    }): GeneratorStatusGql;
    startGenerator(user: {
        id: string;
    }, batchSize: number, intervalMs: number): GeneratorStatusGql;
    stopGenerator(user: {
        id: string;
    }): GeneratorStatusGql;
    generatorStatusChanged(): AsyncIterator<unknown, any, any>;
}
