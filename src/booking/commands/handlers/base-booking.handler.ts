import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';

@Injectable()
export abstract class BaseBookingHandler {
  constructor(protected readonly transaction: TransactionPrismaService) {}

  protected get prisma() {
    return this.transaction.getTransaction();
  }

  protected runInTransaction<T>(handler: () => Promise<T>) {
    return this.transaction.run(handler, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  protected async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  protected async findSlotOrThrow(slotId: string) {
    const slot = await this.prisma.slot.findFirst({
      where: { id: slotId },
      select: {
        id: true,
        isDeleted: true,
        isBooked: true,
        expertId: true,
        price: true,
      },
    });

    if (!slot || slot.isDeleted) {
      throw new NotFoundException('Slot not found');
    }

    return slot;
  }

  protected async findBookingOrThrow(bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId },
      select: {
        id: true,
        isDeleted: true,
        status: true,
        updatedAt: true,
        userId: true,
        slotId: true,
        slot: {
          select: {
            expertId: true,
          },
        },
      },
    });

    if (!booking || booking.isDeleted) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  protected ensureRequesterAccess(params: {
    userId: string;
    slot: { expertId: string };
    requesterId: string;
  }) {
    if (
      params.userId !== params.requesterId &&
      params.slot.expertId !== params.requesterId
    ) {
      throw new ForbiddenException('Permission denied for booking');
    }
  }
}
