import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { TransactionPrismaClient } from '../../database/transaction-prisma.service';

@Injectable()
export class WalletLedgerService {
  async ensureWallet(
    prisma: TransactionPrismaClient,
    userId: string,
  ): Promise<{ id: string; balance: number; userId: string }> {
    return prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
      select: { id: true, balance: true, userId: true },
    });
  }

  ensurePositive(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
  }

  ensureSufficientBalance(balance: number, amount: number) {
    this.ensurePositive(amount);

    if (balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }
  }

  async lockCredits(
    prisma: TransactionPrismaClient,
    params: { userId: string; amount: number; bookingId: string; description?: string },
  ) {
    const wallet = await this.ensureWallet(prisma, params.userId);
    this.ensureSufficientBalance(wallet.balance, params.amount);

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: params.amount } },
    });

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: TransactionType.ESCROW_LOCK,
        amount: params.amount,
        relatedBookingId: params.bookingId,
        description: params.description ?? null,
      },
    });

    return wallet;
  }

  async refundCredits(
    prisma: TransactionPrismaClient,
    params: { userId: string; amount: number; bookingId: string; description?: string },
  ) {
    this.ensurePositive(params.amount);
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

    return wallet;
  }

  async releaseCredits(
    prisma: TransactionPrismaClient,
    params: { expertId: string; amount: number; bookingId: string; description?: string },
  ) {
    this.ensurePositive(params.amount);

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

    return wallet;
  }
}
