import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database';
import {
  getOffsetPagination,
  OffsetPaginationFindManyArgs,
} from 'src/shared/utils/getOffsetPagination';
import { ListUsersQuery, ListUsersQueryData } from '../impl';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: ListUsersQuery) {
    const where = this.buildWhere(data);

    return getOffsetPagination({
      pageData: data,
      count: () => this.getCount(where),
      findMany: (args) => this.findUsers(args, where, data),
    });
  }

  private getCount(where: Prisma.UserWhereInput) {
    return this.prisma.user.count({ where });
  }

  private findUsers(
    { take, skip }: OffsetPaginationFindManyArgs,
    where: Prisma.UserWhereInput,
    data: ListUsersQueryData,
  ) {
    return this.prisma.user.findMany({
      where,
      take,
      skip,
      orderBy: data.orderBy ?? { createdAt: 'desc' },
      include: {
        profile: true,
      },
    });
  }

  private buildWhere(data: ListUsersQueryData): Prisma.UserWhereInput {
    const { search, rating, pricePerHour, tagGroups } = data;

    const query = search?.trim();

    const where: Prisma.UserWhereInput = {
      isDeleted: false,
    };

    if (query) {
      where.OR = [
        { email: { contains: query, mode: 'insensitive' } },
        { profile: { bio: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const profileWhere: Prisma.ProfileWhereInput = {};

    if (rating?.from !== undefined || rating?.to !== undefined) {
      profileWhere.rating = {
        ...(rating.from !== undefined && { gte: rating.from }),
        ...(rating.to !== undefined && { lte: rating.to }),
      };
    }

    if (pricePerHour?.from !== undefined || pricePerHour?.to !== undefined) {
      profileWhere.pricePerHour = {
        ...(pricePerHour.from !== undefined && { gte: pricePerHour.from }),
        ...(pricePerHour.to !== undefined && { lte: pricePerHour.to }),
      };
    }

    if (tagGroups && tagGroups.length > 0) {
      profileWhere.tags = {
        some: {
          tag: {
            group: { in: tagGroups },
            isDeleted: false,
          },
        },
      };
    }

    if (Object.keys(profileWhere).length > 0) {
      profileWhere.isDeleted = false;
      where.profile = profileWhere;
    }

    return where;
  }
}
