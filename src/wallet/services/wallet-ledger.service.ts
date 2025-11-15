import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { TransactionPrismaClient } from '../../database/transaction-prisma.service';
import { MAX_PRICE_PER_HOUR } from '../../shared/constants';

@Injectable()
export class WalletLedgerService {
  private readonly logger = new Logger(WalletLedgerService.name);
  private readonly MAX_TRANSACTION_AMOUNT = MAX_PRICE_PER_HOUR; // 1M credits max per transaction

  async ensureWallet(
    prisma: TransactionPrismaClient,
    userId: string,
  ): Promise<{ id: string; balance: number; userId: string }> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true, balance: true, userId: true },
    });

    if (!wallet) {
      this.logger.error({
        action: 'WALLET_NOT_FOUND',
        userId,
      });
      throw new BadRequestException(
        'Wallet not found. Please create wallet first using createWallet command.',
      );
    }

    return wallet;
  }

  ensureValidAmount(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    if (!Number.isInteger(amount)) {
      throw new BadRequestException('Amount must be an integer');
    }

    if (amount > this.MAX_TRANSACTION_AMOUNT) {
      throw new BadRequestException(
        `Amount exceeds maximum limit of ${this.MAX_TRANSACTION_AMOUNT}`,
      );
    }
  }

  async lockCredits(
    prisma: TransactionPrismaClient,
    params: { userId: string; amount: number; bookingId: string; description?: string },
  ) {
    this.ensureValidAmount(params.amount);

    this.logger.log({
      action: 'LOCK_CREDITS_ATTEMPT',
      userId: params.userId,
      amount: params.amount,
      bookingId: params.bookingId,
    });

    // Проверка существования и владельца бронирования
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      select: {
        id: true,
        userId: true,
        status: true,
        creditsLocked: true,
        slot: {
          select: { price: true },
        },
      },
    });

    if (!booking) {
      this.logger.warn({
        action: 'LOCK_CREDITS_FAILED',
        bookingId: params.bookingId,
        reason: 'Booking not found',
      });
      throw new BadRequestException('Booking not found');
    }

    if (booking.userId !== params.userId) {
      this.logger.warn({
        action: 'LOCK_CREDITS_FAILED',
        userId: params.userId,
        bookingId: params.bookingId,
        bookingOwnerId: booking.userId,
        reason: 'User is not the owner of this booking',
      });
      throw new BadRequestException(
        'Cannot lock credits for another user\'s booking',
      );
    }

    // Проверка статуса бронирования
    if (booking.status !== 'PENDING') {
      this.logger.warn({
        action: 'LOCK_CREDITS_FAILED',
        bookingId: params.bookingId,
        currentStatus: booking.status,
        reason: 'Invalid booking status for locking credits',
      });
      throw new BadRequestException(
        `Cannot lock credits for booking with status ${booking.status}. Expected PENDING.`,
      );
    }

    // Проверка соответствия суммы и цены слота
    if (params.amount !== booking.slot.price) {
      this.logger.warn({
        action: 'LOCK_CREDITS_FAILED',
        requestedAmount: params.amount,
        slotPrice: booking.slot.price,
        reason: 'Amount does not match slot price',
      });
      throw new BadRequestException(
        `Amount ${params.amount} does not match slot price ${booking.slot.price}`,
      );
    }

    // Проверка на двойное списание (idempotency)
    const existingLock = await prisma.transaction.findFirst({
      where: {
        relatedBookingId: params.bookingId,
        type: TransactionType.ESCROW_LOCK,
      },
    });

    if (existingLock) {
      this.logger.warn({
        action: 'LOCK_CREDITS_FAILED',
        userId: params.userId,
        bookingId: params.bookingId,
        reason: 'Credits already locked for this booking',
      });
      throw new BadRequestException(
        'Credits already locked for this booking',
      );
    }

    const wallet = await this.ensureWallet(prisma, params.userId);

    // Атомарная операция с проверкой баланса - защита от race condition
    const updatedWallet = await prisma.wallet.updateMany({
      where: {
        id: wallet.id,
        balance: { gte: params.amount }, // Проверка баланса в WHERE clause
      },
      data: { balance: { decrement: params.amount } },
    });

    if (updatedWallet.count === 0) {
      this.logger.warn({
        action: 'LOCK_CREDITS_FAILED',
        userId: params.userId,
        amount: params.amount,
        reason: 'Insufficient balance',
      });
      throw new BadRequestException('Insufficient wallet balance');
    }

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: TransactionType.ESCROW_LOCK,
        amount: params.amount,
        relatedBookingId: params.bookingId,
        description: params.description ?? null,
      },
    });

    // Обновляем creditsLocked в бронировании
    await prisma.booking.update({
      where: { id: params.bookingId },
      data: { creditsLocked: params.amount },
    });

    this.logger.log({
      action: 'LOCK_CREDITS_SUCCESS',
      userId: params.userId,
      amount: params.amount,
      bookingId: params.bookingId,
      walletId: wallet.id,
    });

    return wallet;
  }

  async refundCredits(
    prisma: TransactionPrismaClient,
    params: { userId: string; amount: number; bookingId: string; description?: string },
  ) {
    this.ensureValidAmount(params.amount);

    this.logger.log({
      action: 'REFUND_CREDITS_ATTEMPT',
      userId: params.userId,
      amount: params.amount,
      bookingId: params.bookingId,
    });

    // Проверка существования и владельца бронирования
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      select: {
        id: true,
        userId: true,
        status: true,
        creditsLocked: true,
        slot: {
          select: { price: true },
        },
      },
    });

    if (!booking) {
      this.logger.warn({
        action: 'REFUND_CREDITS_FAILED',
        bookingId: params.bookingId,
        reason: 'Booking not found',
      });
      throw new BadRequestException('Booking not found');
    }

    if (booking.userId !== params.userId) {
      this.logger.warn({
        action: 'REFUND_CREDITS_FAILED',
        userId: params.userId,
        bookingId: params.bookingId,
        reason: 'User is not the owner of this booking',
      });
      throw new BadRequestException(
        'Cannot refund credits for another user\'s booking',
      );
    }

    // Проверка статуса бронирования (можно возвращать только для PENDING или CONFIRMED)
    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(booking.status)) {
      this.logger.warn({
        action: 'REFUND_CREDITS_FAILED',
        bookingId: params.bookingId,
        currentStatus: booking.status,
        reason: 'Invalid booking status for refund',
      });
      throw new BadRequestException(
        `Cannot refund credits for booking with status ${booking.status}`,
      );
    }

    // Проверка соответствия суммы
    if (params.amount !== booking.slot.price) {
      this.logger.warn({
        action: 'REFUND_CREDITS_FAILED',
        requestedAmount: params.amount,
        slotPrice: booking.slot.price,
        reason: 'Amount does not match slot price',
      });
      throw new BadRequestException(
        `Amount ${params.amount} does not match slot price ${booking.slot.price}`,
      );
    }

    // Проверка на двойной возврат (idempotency)
    const existingRefund = await prisma.transaction.findFirst({
      where: {
        relatedBookingId: params.bookingId,
        type: TransactionType.REFUND,
      },
    });

    if (existingRefund) {
      this.logger.warn({
        action: 'REFUND_CREDITS_FAILED',
        bookingId: params.bookingId,
        reason: 'Credits already refunded for this booking',
      });
      throw new BadRequestException(
        'Credits already refunded for this booking',
      );
    }

    const wallet = await this.ensureWallet(prisma, params.userId);

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: params.amount } },
    });

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: TransactionType.REFUND,
        amount: params.amount,
        relatedBookingId: params.bookingId,
        description: params.description ?? null,
      },
    });

    this.logger.log({
      action: 'REFUND_CREDITS_SUCCESS',
      userId: params.userId,
      amount: params.amount,
      bookingId: params.bookingId,
      walletId: wallet.id,
    });

    return wallet;
  }

  async releaseCredits(
    prisma: TransactionPrismaClient,
    params: { expertId: string; amount: number; bookingId: string; description?: string },
  ) {
    this.ensureValidAmount(params.amount);

    this.logger.log({
      action: 'RELEASE_CREDITS_ATTEMPT',
      expertId: params.expertId,
      amount: params.amount,
      bookingId: params.bookingId,
    });

    // Проверка существования бронирования и владельца слота
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      select: {
        id: true,
        status: true,
        creditsLocked: true,
        slot: {
          select: { expertId: true, price: true },
        },
      },
    });

    if (!booking) {
      this.logger.warn({
        action: 'RELEASE_CREDITS_FAILED',
        bookingId: params.bookingId,
        reason: 'Booking not found',
      });
      throw new BadRequestException('Booking not found');
    }

    if (booking.slot.expertId !== params.expertId) {
      this.logger.warn({
        action: 'RELEASE_CREDITS_FAILED',
        expertId: params.expertId,
        bookingId: params.bookingId,
        slotExpertId: booking.slot.expertId,
        reason: 'Expert is not the owner of this booking\'s slot',
      });
      throw new BadRequestException(
        'Cannot release credits for another expert\'s booking',
      );
    }

    // Проверка статуса бронирования (можно освобождать только CONFIRMED или COMPLETED)
    if (!['CONFIRMED', 'COMPLETED'].includes(booking.status)) {
      this.logger.warn({
        action: 'RELEASE_CREDITS_FAILED',
        bookingId: params.bookingId,
        currentStatus: booking.status,
        reason: 'Invalid booking status for release',
      });
      throw new BadRequestException(
        `Cannot release credits for booking with status ${booking.status}. Expected CONFIRMED or COMPLETED.`,
      );
    }

    // Проверка соответствия суммы
    if (params.amount !== booking.slot.price) {
      this.logger.warn({
        action: 'RELEASE_CREDITS_FAILED',
        requestedAmount: params.amount,
        slotPrice: booking.slot.price,
        reason: 'Amount does not match slot price',
      });
      throw new BadRequestException(
        `Amount ${params.amount} does not match slot price ${booking.slot.price}`,
      );
    }

    // Проверка на двойное освобождение (idempotency)
    const existingRelease = await prisma.transaction.findFirst({
      where: {
        relatedBookingId: params.bookingId,
        type: TransactionType.ESCROW_RELEASE,
      },
    });

    if (existingRelease) {
      this.logger.warn({
        action: 'RELEASE_CREDITS_FAILED',
        bookingId: params.bookingId,
        reason: 'Credits already released for this booking',
      });
      throw new BadRequestException(
        'Credits already released for this booking',
      );
    }

    const wallet = await this.ensureWallet(prisma, params.expertId);

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: params.amount } },
    });

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: TransactionType.ESCROW_RELEASE,
        amount: params.amount,
        relatedBookingId: params.bookingId,
        description: params.description ?? null,
      },
    });

    this.logger.log({
      action: 'RELEASE_CREDITS_SUCCESS',
      expertId: params.expertId,
      amount: params.amount,
      bookingId: params.bookingId,
      walletId: wallet.id,
    });

    return wallet;
  }
}
