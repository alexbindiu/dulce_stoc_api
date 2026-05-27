import { GeneratorService } from './generator.service';
export declare class GeneratorController {
    private readonly generatorService;
    constructor(generatorService: GeneratorService);
    getStatus(user: {
        id: string;
    }): import("./generator.service").GeneratorStatus;
    start(user: {
        id: string;
    }, dto: any): import("./generator.service").GeneratorStatus;
    stop(user: {
        id: string;
    }): import("./generator.service").GeneratorStatus;
}
