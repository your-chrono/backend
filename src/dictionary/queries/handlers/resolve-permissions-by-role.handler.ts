import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/database/prisma.service';
import {
  ResolvePermissionsByRoleQuery,
  ResolvePermissionsByRoleQueryReturnType,
} from '../impl';

@QueryHandler(ResolvePermissionsByRoleQuery)
export class ResolvePermissionsByRoleHandler
  implements
    IQueryHandler<
      ResolvePermissionsByRoleQuery,
      ResolvePermissionsByRoleQueryReturnType
    >
{
  constructor(private readonly prisma: PrismaService) {}

  public execute({ data }: ResolvePermissionsByRoleQuery) {
    return this.prisma.role
      .findUniqueOrThrow({
        where: {
          id: data.roleId,
        },
      })
      .permissions();
  }
}
