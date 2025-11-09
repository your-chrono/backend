import { RoleId, Permission } from '@prisma/client';

export class ResolvePermissionsByRoleQuery {
  constructor(
    public readonly data: {
      readonly roleId: RoleId;
    },
  ) {}
}

export type ResolvePermissionsByRoleQueryReturnType = Permission[];

export type ResolvePermissionsByRoleQueryData =
  ResolvePermissionsByRoleQuery['data'];
