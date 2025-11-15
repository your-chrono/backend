import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';
import { WalletLedgerService } from '../../../wallet/services/wallet-ledger.service';

@Injectable()
export abstract class BaseBookingHandler {
  constructor(
    protected readonly transaction: TransactionPrismaService,
    protected readonly walletLedger: WalletLedgerService,
  ) {}

  protected get prisma() {
    return this.transaction.getTransaction();
  }

  protected runInTransaction<T>(handler: () => Promise<T>) {
    return this.transaction.run(handler, {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
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
        startTime: true,
        endTime: true,
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
        creditsLocked: true,
        slot: {
          select: {
            expertId: true,
            price: true,
            isDeleted: true,
          },
        },
      },
    });

    if (!booking || booking.isDeleted) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.slot.isDeleted) {
      throw new NotFoundException('Associated slot has been deleted');
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

  protected async ensureWallet(userId: string) {
    return this.walletLedger.ensureWallet(this.prisma, userId);
  }

  protected ensureSufficientBalance(balance: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    if (balance < amount) {
      throw new BadRequestException('Insufficient credits balance');
    }
  }

  protected lockBookingCredits(params: {
    userId: string;
    amount: number;
    bookingId: string;
    description?: string;
  }) {
    return this.walletLedger.lockCredits(this.prisma, params);
  }

  protected refundBookingCredits(params: {
    userId: string;
    amount: number;
    bookingId: string;
    description?: string;
  }) {
    return this.walletLedger.refundCredits(this.prisma, params);
  }

  protected releaseBookingCredits(params: {
    expertId: string;
    amount: number;
    bookingId: string;
    description?: string;
  }) {
    return this.walletLedger.releaseCredits(this.prisma, params);
  }

  protected ensureValidExpectedVersion(expectedVersion?: Date) {
    if (expectedVersion !== undefined) {
      if (!expectedVersion || isNaN(expectedVersion.getTime())) {
        throw new BadRequestException('expectedVersion must be a valid date');
      }
    }
  }
}
