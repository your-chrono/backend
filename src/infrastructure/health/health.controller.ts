import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseCheck } from 'src/infrastructure/health/database.check';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: DatabaseCheck,
  ) {}

  @Get('liveness')
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  @Get('readiness')
  @HealthCheck()
  readiness() {
    return this.health.check([() => this.prisma.check()]);
  }
}
