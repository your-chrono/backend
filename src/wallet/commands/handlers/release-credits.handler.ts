import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ReleaseCreditsCommand,
  ReleaseCreditsCommandReturnType,
} from '../impl';
import { TransactionPrismaService } from '../../../database/transaction-prisma.service';
import { WalletLedgerService } from '../../services/wallet-ledger.service';

@CommandHandler(ReleaseCreditsCommand)
export class ReleaseCreditsHandler
  implements
    ICommandHandler<ReleaseCreditsCommand, ReleaseCreditsCommandReturnType>
{
  constructor(
    private readonly transaction: TransactionPrismaService,
    private readonly ledger: WalletLedgerService,
  ) {}

  async execute({
    data,
  }: ReleaseCreditsCommand): Promise<ReleaseCreditsCommandReturnType> {
    return this.transaction.run(async () => {
      const prisma = this.transaction.getTransaction();
      const wallet = await this.ledger.releaseCredits(prisma, data);

      return { walletId: wallet.id };
    });
  }
}
