import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../database';
import { GetUserQuery, GetUserQueryReturnType } from '../impl';

@QueryHandler(GetUserQuery)
export class GetUserHandler
  implements IQueryHandler<GetUserQuery, GetUserQueryReturnType>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: GetUserQuery): Promise<GetUserQueryReturnType> {
    const user = await this.prisma.user.findFirst({
      where: { id: data.userId, isDeleted: false },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
