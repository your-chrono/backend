import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';

@Injectable()
export abstract class BaseSlotHandler {
  constructor(protected readonly transaction: TransactionPrismaService) {}

  protected get prisma() {
    return this.transaction.getTransaction();
  }

  protected runInTransaction<T>(handler: () => Promise<T>) {
    return this.transaction.run(handler, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  protected async ensureExpertExists(expertId: string) {
    const expert = await this.prisma.user.findFirst({
      where: { id: expertId, isDeleted: false },
      select: { id: true },
    });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }
  }

  protected async findSlotOrThrow(slotId: string, expertId: string) {
    const slot = await this.prisma.slot.findFirst({
      where: { id: slotId, expertId, isDeleted: false },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    return slot;
  }

  protected ensureTimeRange(startTime: Date, endTime: Date) {
    if (startTime >= endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }
  }

  protected ensurePrice(price: number) {
    if (!Number.isFinite(price) || price < 0) {
      throw new BadRequestException('price must be a non-negative number');
    }
  }

  protected async ensureNoOverlap(params: {
    expertId: string;
    startTime: Date;
    endTime: Date;
    excludeSlotId?: string;
  }) {
    const overlappingSlot = await this.prisma.slot.findFirst({
      where: {
        expertId: params.expertId,
        isDeleted: false,
        id: params.excludeSlotId ? { not: params.excludeSlotId } : undefined,
        startTime: { lt: params.endTime },
        endTime: { gt: params.startTime },
      },
      select: { id: true },
    });

    if (overlappingSlot) {
      throw new BadRequestException('Slot overlaps with another slot');
    }
  }
}
