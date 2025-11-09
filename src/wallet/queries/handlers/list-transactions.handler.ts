import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../database';
import {
  ListTransactionsQuery,
  ListTransactionsQueryReturnType,
} from '../impl';
import { getOffsetPagination } from '../../../shared/utils/getOffsetPagination';

@Injectable()
@QueryHandler(ListTransactionsQuery)
export class ListTransactionsHandler
  implements
    IQueryHandler<ListTransactionsQuery, ListTransactionsQueryReturnType>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: ListTransactionsQuery) {
    const wallet = await this.prisma.wallet.upsert({
      where: { userId: data.userId },
      update: {},
      create: { userId: data.userId },
      select: { id: true },
    });

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
