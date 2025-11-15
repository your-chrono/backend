import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/database/prisma.service';
import {
  ResolveTagsByProfileIdQuery,
  ResolveTagsByProfileIdQueryReturnType,
} from 'src/user/queries/impl';

@QueryHandler(ResolveTagsByProfileIdQuery)
export class ResolveTagsByProfileIdHandler
  implements
    IQueryHandler<
      ResolveTagsByProfileIdQuery,
      ResolveTagsByProfileIdQueryReturnType
    >
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    data,
  }: ResolveTagsByProfileIdQuery): Promise<ResolveTagsByProfileIdQueryReturnType> {
    // Проверка существования профиля
    const profile = await this.prisma.profile.findFirst({
      where: { id: data.profileId, isDeleted: false },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.tag.findMany({
      where: {
        profiles: {
          some: { profileId: data.profileId },
        },
        isDeleted: false,
      },
    });
  }
}
