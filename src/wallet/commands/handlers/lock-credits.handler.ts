import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LockCreditsCommand, LockCreditsCommandReturnType } from '../impl';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';
import { WalletLedgerService } from '../../services/wallet-ledger.service';

@CommandHandler(LockCreditsCommand)
export class LockCreditsHandler
  implements ICommandHandler<LockCreditsCommand, LockCreditsCommandReturnType>
{
  constructor(
    private readonly transaction: TransactionPrismaService,
    private readonly ledger: WalletLedgerService,
  ) {}

  async execute({
    data,
  }: LockCreditsCommand): Promise<LockCreditsCommandReturnType> {
    return this.transaction.run(async () => {
      const prisma = this.transaction.getTransaction();
      const wallet = await this.ledger.lockCredits(prisma, data);

      return { walletId: wallet.id };
    });
  }
}
