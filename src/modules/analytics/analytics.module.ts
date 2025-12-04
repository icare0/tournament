import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsQueryService } from './services/analytics-query.service';
import { ExportService } from './services/export.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsQueryService, ExportService],
  exports: [AnalyticsService, AnalyticsQueryService, ExportService],
})
export class AnalyticsModule {}
