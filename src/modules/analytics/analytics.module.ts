import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsQueryService } from './services/analytics-query.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsQueryService],
  exports: [AnalyticsService, AnalyticsQueryService],
})
export class AnalyticsModule {}
