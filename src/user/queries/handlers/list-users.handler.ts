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
      findMany: (args) => this.findUsers(args, where),
    });
  }

  private getCount(where: Prisma.UserWhereInput) {
    return this.prisma.user.count({ where });
  }

  private findUsers(
    { take, skip }: OffsetPaginationFindManyArgs,
    where: Prisma.UserWhereInput,
  ) {
    return this.prisma.user.findMany({
      where,
      take,
      skip,
      include: {
        profile: true,
      },
    });
  }

  private buildWhere(data: ListUsersQueryData): Prisma.UserWhereInput {
    const query = data.search?.trim();

    const where: Prisma.UserWhereInput = {
      isDeleted: false,
    };

    if (!query) return where;

    where.OR = [
      { email: { contains: query, mode: 'insensitive' } },
      { profile: { bio: { contains: query, mode: 'insensitive' } } },
      {
        profile: {
          tags: {
            some: {
              tag: { name: { contains: query, mode: 'insensitive' } },
            },
          },
        },
      },
    ];

    return where;
  }
}
