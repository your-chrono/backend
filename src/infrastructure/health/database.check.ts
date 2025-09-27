import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../../database';

@Injectable()
export class DatabaseCheck {
  constructor(
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
  ) {}

  public check(): Promise<HealthIndicatorResult> {
    return this.prismaHealth.pingCheck('database', this.prismaService);
  }
}
