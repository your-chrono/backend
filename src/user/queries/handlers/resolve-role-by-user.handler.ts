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

  public execute({ data }: ResolveRoleByUserQuery) {
    return this.prisma.user
      .findUniqueOrThrow({
        where: { id: data.userId },
      })
      .role();
  }
}
