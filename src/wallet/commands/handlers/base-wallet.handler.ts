import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';

@Injectable()
export abstract class BaseWalletHandler {
  constructor(protected readonly transaction: TransactionPrismaService) {}

  protected get prisma() {
    return this.transaction.getTransaction();
  }

  protected runInTransaction<T>(handler: () => Promise<T>) {
    return this.transaction.run(handler, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  protected ensurePositiveAmount(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
  }

  protected ensureSufficientBalance(balance: number, amount: number) {
    if (balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }
  }

  protected async ensureWallet(userId: string) {
    return this.prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
      select: { id: true, balance: true, userId: true },
    });
  }
}
