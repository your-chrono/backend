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
    return this.prisma.tag.findMany({
      where: {
        profiles: {
          some: { profileId: data.profileId },
        },
      },
    });
  }
}
