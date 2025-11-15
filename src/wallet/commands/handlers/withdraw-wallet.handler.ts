import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(WithdrawWalletHandler.name);
  private readonly DAILY_WITHDRAWAL_LIMIT = 100_000; // 100k credits per day

  async execute({ data }: WithdrawWalletCommand) {
    this.ledger.ensureValidAmount(data.amount);

    this.logger.log({
      action: 'WITHDRAW_WALLET_ATTEMPT',
      userId: data.userId,
      amount: data.amount,
    });

    return this.runInTransaction(async () => {
      // Проверка верификации пользователя
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
        select: {
          id: true,
          profile: {
            select: { verified: true },
          },
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (!user.profile?.verified) {
        this.logger.warn({
          action: 'WITHDRAW_WALLET_FAILED',
          userId: data.userId,
          reason: 'User not verified',
        });
        throw new BadRequestException(
          'Profile verification required for withdrawal',
        );
      }

      // Проверка дневного лимита
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayWithdrawals = await this.prisma.transaction.aggregate({
        where: {
          wallet: { userId: data.userId },
          type: TransactionType.DEBIT,
          createdAt: { gte: startOfDay },
        },
        _sum: { amount: true },
      });

      const todayTotal = (todayWithdrawals._sum.amount || 0) + data.amount;

      if (todayTotal > this.DAILY_WITHDRAWAL_LIMIT) {
        this.logger.warn({
          action: 'WITHDRAW_WALLET_FAILED',
          userId: data.userId,
          todayTotal,
          limit: this.DAILY_WITHDRAWAL_LIMIT,
          reason: 'Daily limit exceeded',
        });
        throw new BadRequestException(
          `Daily withdrawal limit of ${this.DAILY_WITHDRAWAL_LIMIT} credits exceeded`,
        );
      }

      const wallet = await this.ledger.ensureWallet(this.prisma, data.userId);

      // Атомарная проверка баланса
      const updatedWallet = await this.prisma.wallet.updateMany({
        where: {
          id: wallet.id,
          balance: { gte: data.amount },
        },
        data: {
          balance: { decrement: data.amount },
        },
      });

      if (updatedWallet.count === 0) {
        this.logger.warn({
          action: 'WITHDRAW_WALLET_FAILED',
          userId: data.userId,
          amount: data.amount,
          reason: 'Insufficient balance',
        });
        throw new BadRequestException('Insufficient wallet balance');
      }

      await this.prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          amount: data.amount,
          description: data.description ?? null,
        },
      });

      this.logger.log({
        action: 'WITHDRAW_WALLET_SUCCESS',
        userId: data.userId,
        amount: data.amount,
        walletId: wallet.id,
      });

      return { walletId: wallet.id };
    });
  }
}
