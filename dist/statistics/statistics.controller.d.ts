import { StatisticsService } from './statistics.service';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getSummary(user: {
        id: string;
    }): Promise<import("./statistics.service").StatisticsSummary>;
}
