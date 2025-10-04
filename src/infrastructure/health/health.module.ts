import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from 'src/infrastructure/health/health.controller';
import { DatabaseCheck } from 'src/infrastructure/health/database.check';
import { DatabaseModule } from '../../database';

@Module({
  imports: [DatabaseModule, ConfigModule, TerminusModule],
  controllers: [HealthController],
  providers: [DatabaseCheck],
})
export class HealthModule {}
