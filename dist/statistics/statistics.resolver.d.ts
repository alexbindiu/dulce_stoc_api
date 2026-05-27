import { StatisticsService, StatisticsSummary } from './statistics.service';
export declare class StatisticsResolver {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    statistics(user: {
        id: string;
    }): Promise<StatisticsSummary>;
}
