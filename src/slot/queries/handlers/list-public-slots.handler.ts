import { BadRequestException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database';
import { getOffsetPagination } from '../../../shared';
import {
  ListPublicSlotsQuery,
  ListPublicSlotsQueryData,
  ListPublicSlotsQueryReturnType,
} from '../impl';

@QueryHandler(ListPublicSlotsQuery)
export class ListPublicSlotsHandler
  implements
    IQueryHandler<ListPublicSlotsQuery, ListPublicSlotsQueryReturnType>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: ListPublicSlotsQuery) {
    this.ensurePayload(data);
    const where = this.buildWhere(data);

    return getOffsetPagination({
      pageData: data,
      findMany: ({ take, skip }) =>
        this.prisma.slot.findMany({
          where,
          take,
          skip,
          orderBy: { startTime: 'asc' },
        }),
      count: () => this.prisma.slot.count({ where }),
    });
  }

  private ensurePayload(data: ListPublicSlotsQueryData) {
    if (data.minPrice !== undefined && data.minPrice < 0) {
      throw new BadRequestException('minPrice must be a non-negative number');
    }

    if (data.maxPrice !== undefined && data.maxPrice < 0) {
      throw new BadRequestException('maxPrice must be a non-negative number');
    }

    if (
      data.minPrice !== undefined &&
      data.maxPrice !== undefined &&
      data.minPrice > data.maxPrice
    ) {
      throw new BadRequestException('minPrice cannot be greater than maxPrice');
    }

    if (data.from && data.to && data.from > data.to) {
      throw new BadRequestException('from cannot be later than to');
    }
  }

  private buildWhere(
    data: ListPublicSlotsQueryData,
  ): Prisma.SlotWhereInput {
    const where: Prisma.SlotWhereInput = {
      isDeleted: false,
      isBooked: false,
      expertId: data.expertId,
    };

    if (data.from || data.to) {
      const startTimeFilter: Prisma.DateTimeFilter = {};

      if (data.from) {
        startTimeFilter.gte = data.from;
      }

      if (data.to) {
        startTimeFilter.lte = data.to;
      }

      where.startTime = startTimeFilter;
    }

    if (data.format) {
      where.format = data.format;
    }

    if (data.minPrice !== undefined || data.maxPrice !== undefined) {
      const priceFilter: Prisma.IntFilter = {};

      if (data.minPrice !== undefined) {
        priceFilter.gte = data.minPrice;
      }

      if (data.maxPrice !== undefined) {
        priceFilter.lte = data.maxPrice;
      }

      where.price = priceFilter;
    }

    return where;
  }
}
