import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from './infrastructure/health/health.module';
import { DatabaseModule } from './database';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphqlApiModule } from './graphql-api/graphql-api.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications';

@Module({
  imports: [
    GraphqlApiModule.register(),
    ScheduleModule.forRoot(),
    DatabaseModule,
    ConfigModule.forRoot(),
    HealthModule,
    AuthModule,
    NotificationsModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
