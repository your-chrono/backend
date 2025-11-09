import { Injectable } from '@nestjs/common';
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
    return this.prisma.wallet.upsert({
      where: { userId: data.userId },
      update: {},
      create: { userId: data.userId },
    });
  }
}
