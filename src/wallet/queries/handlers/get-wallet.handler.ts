import { Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../database';
import { GetWalletQuery, GetWalletQueryReturnType } from '../impl';

@Injectable()
@QueryHandler(GetWalletQuery)
export class GetWalletHandler
  implements IQueryHandler<GetWalletQuery, GetWalletQueryReturnType>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: GetWalletQuery) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: data.userId },
    });

    if (!wallet) {
      throw new NotFoundException(
        'Wallet not found. Please contact support to create your wallet.',
      );
    }

    return wallet;
  }
}
