import { Injectable } from '@nestjs/common';
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
  async execute({ data }: TopUpWalletCommand) {
    this.ensurePositiveAmount(data.amount);

    return this.runInTransaction(async () => {
      const wallet = await this.ensureWallet(data.userId);

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

      return { walletId: updatedWallet.id };
    });
  }
}
