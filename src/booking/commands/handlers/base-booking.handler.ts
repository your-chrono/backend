import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
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
        creditsLocked: true,
        slot: {
          select: {
            expertId: true,
            price: true,
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

  protected async getOrCreateWallet(userId: string) {
    return this.prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
      select: { id: true, balance: true, userId: true },
    });
  }

  protected ensureSufficientBalance(balance: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    if (balance < amount) {
      throw new BadRequestException('Insufficient credits balance');
    }
  }

  protected async lockCredits(params: {
    walletId: string;
    amount: number;
    bookingId: string;
    description?: string;
  }) {
    await this.prisma.wallet.update({
      where: { id: params.walletId },
      data: { balance: { decrement: params.amount } },
    });

    await this.prisma.transaction.create({
      data: {
        walletId: params.walletId,
        type: TransactionType.ESCROW_LOCK,
        amount: params.amount,
        relatedBookingId: params.bookingId,
        description: params.description ?? null,
      },
    });
  }

  protected async refundCredits(params: {
    walletId: string;
    amount: number;
    bookingId: string;
    description?: string;
  }) {
    await this.prisma.wallet.update({
      where: { id: params.walletId },
      data: { balance: { increment: params.amount } },
    });

    await this.prisma.transaction.create({
      data: {
        walletId: params.walletId,
        type: TransactionType.REFUND,
        amount: params.amount,
        relatedBookingId: params.bookingId,
        description: params.description ?? null,
      },
    });
  }

  protected async releaseCreditsToExpert(params: {
    expertId: string;
    amount: number;
    bookingId: string;
    description?: string;
  }) {
    const expertWallet = await this.getOrCreateWallet(params.expertId);

    await this.prisma.wallet.update({
      where: { id: expertWallet.id },
      data: { balance: { increment: params.amount } },
    });

    await this.prisma.transaction.create({
      data: {
        walletId: expertWallet.id,
        type: TransactionType.ESCROW_RELEASE,
        amount: params.amount,
        relatedBookingId: params.bookingId,
        description: params.description ?? null,
      },
    });
  }
}
