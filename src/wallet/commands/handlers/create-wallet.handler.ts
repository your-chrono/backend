import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateWalletCommand } from '../impl/create-wallet.command';
import { BaseWalletHandler } from './base-wallet.handler';

@Injectable()
@CommandHandler(CreateWalletCommand)
export class CreateWalletHandler
  extends BaseWalletHandler
  implements ICommandHandler<CreateWalletCommand>
{
  private readonly logger = new Logger(CreateWalletHandler.name);

  async execute({ data }: CreateWalletCommand) {
    this.logger.log({
      action: 'CREATE_WALLET_ATTEMPT',
      userId: data.userId,
    });

    return this.runInTransaction(async () => {
      // Проверка существования пользователя
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true },
      });

      if (!user) {
        this.logger.warn({
          action: 'CREATE_WALLET_FAILED',
          userId: data.userId,
          reason: 'User not found',
        });
        throw new ConflictException('User not found');
      }

      // Проверка существования кошелька
      const existingWallet = await this.prisma.wallet.findUnique({
        where: { userId: data.userId },
      });

      if (existingWallet) {
        this.logger.warn({
          action: 'CREATE_WALLET_FAILED',
          userId: data.userId,
          reason: 'Wallet already exists',
        });
        throw new ConflictException('Wallet already exists for this user');
      }

      // Создание кошелька
      const wallet = await this.prisma.wallet.create({
        data: {
          userId: data.userId,
          balance: 0,
        },
        select: { id: true },
      });

      this.logger.log({
        action: 'CREATE_WALLET_SUCCESS',
        userId: data.userId,
        walletId: wallet.id,
      });

      return { walletId: wallet.id };
    });
  }
}
