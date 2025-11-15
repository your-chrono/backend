import { IPaginatedType } from '../../../shared';
import { Prisma, TagGroup, User } from '@prisma/client';

export class ListUsersQuery {
  constructor(
    public readonly data: {
      readonly search?: string;
      readonly first: number;
      readonly after?: string;

      readonly rating?: { readonly from?: number; to?: number };
      readonly pricePerHour?: { readonly from?: number; to?: number };
      readonly tagGroups?: TagGroup[];

      readonly orderBy?: Prisma.UserFindManyArgs['orderBy'];
    },
  ) {}
}

export type ListUsersQueryData = ListUsersQuery['data'];

export type ListUsersQueryReturnType = IPaginatedType<User>;
