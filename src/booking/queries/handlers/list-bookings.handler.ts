import { BadRequestException, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../database';
import {
  ListBookingsQuery,
  ListBookingsQueryReturnType,
} from '../impl/list-bookings.query';
import { getOffsetPagination } from '../../../shared/utils/getOffsetPagination';

@Injectable()
@QueryHandler(ListBookingsQuery)
export class ListBookingsHandler
  implements IQueryHandler<ListBookingsQuery, ListBookingsQueryReturnType>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: ListBookingsQuery) {
    if (!data.userId && !data.expertId) {
      throw new BadRequestException(
        'Either userId or expertId must be provided',
      );
    }

    return getOffsetPagination({
      pageData: { first: data.first, after: data.after },
      findMany: ({ take, skip }) =>
        this.prisma.booking.findMany({
          where: {
            isDeleted: false,
            status: data.status,
            userId: data.userId,
            slot: data.expertId
              ? {
                  expertId: data.expertId,
                }
              : undefined,
          },
          orderBy: { createdAt: 'desc' },
          take,
          skip,
        }),
      count: () =>
        this.prisma.booking.count({
          where: {
            isDeleted: false,
            status: data.status,
            userId: data.userId,
            slot: data.expertId
              ? {
                  expertId: data.expertId,
                }
              : undefined,
          },
        }),
    });
  }
}
