import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';

// Core modules
import { PrismaModule } from './common/prisma/prisma.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { TournamentModule } from './modules/tournament/tournament.module';
import { RefereeModule } from './modules/referee/referee.module';
import { BillingModule } from './modules/billing/billing.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Scheduling (for cron jobs)
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60'),
        limit: parseInt(process.env.THROTTLE_LIMIT || '10'),
      },
    ]),

    // Bull Queue for background jobs
    BullModule.forRoot({
      redis: {
        host: process.env.BULL_REDIS_HOST || 'localhost',
        port: parseInt(process.env.BULL_REDIS_PORT || '6379'),
      },
    }),

    // Cache (Redis)
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default
    }),

    // Core modules
    PrismaModule,

    // Feature modules
    AuthModule,
    TournamentModule,
    RefereeModule,
    BillingModule,
    RealtimeModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
