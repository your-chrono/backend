import { Injectable, Logger } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TopUpWalletCommand } from '../impl';
import { BaseWalletHandler } from './base-wallet.handler';

@Injectable()
@CommandHandler(TopUpWalletCommand)
export class TopUpWalletHandler
  extends BaseWalletHandler
  implements ICommandHandler<TopUpWalletCommand>
{
  private readonly logger = new Logger(TopUpWalletHandler.name);

  async execute({ data }: TopUpWalletCommand) {
    this.ledger.ensureValidAmount(data.amount);

    this.logger.log({
      action: 'TOP_UP_WALLET_ATTEMPT',
      userId: data.userId,
      amount: data.amount,
    });

    return this.runInTransaction(async () => {
      const wallet = await this.ledger.ensureWallet(this.prisma, data.userId);

      const updatedWallet = await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: data.amount },
        },
        select: { id: true },
      });

      await this.prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.CREDIT,
          amount: data.amount,
          description: data.description ?? null,
        },
      });

      this.logger.log({
        action: 'TOP_UP_WALLET_SUCCESS',
        userId: data.userId,
        amount: data.amount,
        walletId: updatedWallet.id,
      });

      return { walletId: updatedWallet.id };
    });
  }
}
