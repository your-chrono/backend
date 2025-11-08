import { Role } from '@prisma/client';

export class ResolveRoleByUserQuery {
  constructor(public readonly data: { readonly userId: string }) {}
}

export type ResolveRoleByUserQueryReturnType = Role;

export type ResolveRoleByUserQueryData = ResolveRoleByUserQuery['data'];
