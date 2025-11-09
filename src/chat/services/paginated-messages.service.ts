import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from '../../database';
import { getOffsetPagination } from '../../shared/utils/getOffsetPagination';
import { IPaginatedType } from '../../shared/types';

type PaginatedMessagesArgs = {
  chatId: string;
  first: number;
  after?: string;
};

@Injectable()
export class PaginatedMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  getMessagesConnection({
    chatId,
    first,
    after,
  }: PaginatedMessagesArgs): Promise<IPaginatedType<Message>> {
    return getOffsetPagination({
      pageData: { first, after },
      findMany: ({ skip, take }) =>
        this.prisma.message.findMany({
          where: {
            chatId,
            isDeleted: false,
          },
          orderBy: {
            createdAt: 'asc',
          },
          skip,
          take,
        }),
      count: () =>
        this.prisma.message.count({
          where: {
            chatId,
            isDeleted: false,
          },
        }),
    });
  }
}
