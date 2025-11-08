import { IPaginatedType } from '../../../shared';
import { User } from '@prisma/client';

export class ListUsersQuery {
  constructor(
    public readonly data: {
      readonly search?: string;
      readonly first: number;
      readonly after?: string;
    },
  ) {}
}

export type ListUsersQueryData = ListUsersQuery['data'];

export type ListUsersQueryReturnType = IPaginatedType<User>;
