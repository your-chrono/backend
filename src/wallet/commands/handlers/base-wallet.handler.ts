import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';
import { WalletLedgerService } from '../../services/wallet-ledger.service';

@Injectable()
export abstract class BaseWalletHandler {
  constructor(
    protected readonly transaction: TransactionPrismaService,
    protected readonly ledger: WalletLedgerService,
  ) {}

  protected get prisma() {
    return this.transaction.getTransaction();
  }

  protected runInTransaction<T>(handler: () => Promise<T>) {
    return this.transaction.run(handler, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }
}
