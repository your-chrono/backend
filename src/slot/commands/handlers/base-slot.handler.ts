import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';
import {
  MILLISECONDS_IN_WORKING_DAY,
  MAX_PRICE_PER_HOUR,
  MIN_TAGS_COUNT,
  MAX_SLOTS_PER_SYNC,
} from '../../../shared/constants';

@Injectable()
export abstract class BaseSlotHandler {
  constructor(protected readonly transaction: TransactionPrismaService) {}

  protected get prisma() {
    return this.transaction.getTransaction();
  }

  protected runInTransaction<T>(handler: () => Promise<T>) {
    return this.transaction.run(handler, {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
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
    // Validate dates are valid
    if (!startTime || isNaN(startTime.getTime())) {
      throw new BadRequestException('startTime must be a valid date');
    }

    if (!endTime || isNaN(endTime.getTime())) {
      throw new BadRequestException('endTime must be a valid date');
    }

    const now = new Date();

    if (startTime < now) {
      throw new BadRequestException('startTime cannot be in the past');
    }

    if (startTime >= endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    // Maximum slot duration: 8 hours
    const maxDuration = MILLISECONDS_IN_WORKING_DAY;
    const duration = endTime.getTime() - startTime.getTime();

    if (duration > maxDuration) {
      throw new BadRequestException(
        'Slot duration cannot exceed 8 hours',
      );
    }
  }

  protected ensurePrice(price: number) {
    if (!Number.isFinite(price) || price < 0) {
      throw new BadRequestException('price must be a non-negative number');
    }

    if (price > MAX_PRICE_PER_HOUR) {
      throw new BadRequestException(
        'price exceeds maximum limit of 1,000,000 credits',
      );
    }

    if (!Number.isInteger(price)) {
      throw new BadRequestException('price must be an integer');
    }
  }

  protected ensureDescription(description?: string) {
    if (description !== undefined && description !== null && description !== '') {
      if (description.length < MIN_TAGS_COUNT) {
        throw new BadRequestException(
          'description must be at least 3 characters',
        );
      }

      if (description.length > MAX_SLOTS_PER_SYNC) {
        throw new BadRequestException(
          'description cannot exceed 500 characters',
        );
      }
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
