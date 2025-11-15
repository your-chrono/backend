import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/database/prisma.service';
import {
  ResolveRoleByUserQuery,
  ResolveRoleByUserQueryReturnType,
} from 'src/user/queries/impl';

@QueryHandler(ResolveRoleByUserQuery)
export class ResolveRoleByUserHandler
  implements
    IQueryHandler<ResolveRoleByUserQuery, ResolveRoleByUserQueryReturnType>
{
  constructor(private readonly prisma: PrismaService) {}

  public async execute({ data }: ResolveRoleByUserQuery) {
    const user = await this.prisma.user.findFirst({
      where: { id: data.userId, isDeleted: false },
      select: { roleId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: user.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }
}
