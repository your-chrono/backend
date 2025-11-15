import { Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../database';
import {
  ListTransactionsQuery,
  ListTransactionsQueryReturnType,
} from '../impl';
import { getOffsetPagination } from '../../../shared';

@Injectable()
@QueryHandler(ListTransactionsQuery)
export class ListTransactionsHandler
  implements
    IQueryHandler<ListTransactionsQuery, ListTransactionsQueryReturnType>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: ListTransactionsQuery) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: data.userId },
      select: { id: true },
    });

    if (!wallet) {
      throw new NotFoundException(
        'Wallet not found. Please contact support to create your wallet.',
      );
    }

    const where = {
      walletId: wallet.id,
      type: data.type,
    };

    return getOffsetPagination({
      pageData: { first: data.first, after: data.after },
      findMany: ({ take, skip }) =>
        this.prisma.transaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take,
          skip,
        }),
      count: () => this.prisma.transaction.count({ where }),
    });
  }
}
