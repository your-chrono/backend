import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  RefundCreditsCommand,
  RefundCreditsCommandReturnType,
} from '../impl';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';
import { WalletLedgerService } from '../../services/wallet-ledger.service';

@CommandHandler(RefundCreditsCommand)
export class RefundCreditsHandler
  implements
    ICommandHandler<RefundCreditsCommand, RefundCreditsCommandReturnType>
{
  constructor(
    private readonly transaction: TransactionPrismaService,
    private readonly ledger: WalletLedgerService,
  ) {}

  async execute({
    data,
  }: RefundCreditsCommand): Promise<RefundCreditsCommandReturnType> {
    return this.transaction.run(async () => {
      const prisma = this.transaction.getTransaction();
      const wallet = await this.ledger.refundCredits(prisma, data);

      return { walletId: wallet.id };
    });
  }
}
