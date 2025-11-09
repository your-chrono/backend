import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WithdrawWalletCommand } from '../impl';
import { BaseWalletHandler } from './base-wallet.handler';

@Injectable()
@CommandHandler(WithdrawWalletCommand)
export class WithdrawWalletHandler
  extends BaseWalletHandler
  implements ICommandHandler<WithdrawWalletCommand>
{
  async execute({ data }: WithdrawWalletCommand) {
    this.ensurePositiveAmount(data.amount);

    return this.runInTransaction(async () => {
      const wallet = await this.ensureWallet(data.userId);

      this.ensureSufficientBalance(wallet.balance, data.amount);

      const updatedWallet = await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: data.amount },
        },
        select: { id: true },
      });

      await this.prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          amount: data.amount,
          description: data.description ?? null,
        },
      });

      return { walletId: updatedWallet.id };
    });
  }
}
