import { User } from '@prisma/client';

export class GetUserQuery {
  constructor(
    public readonly data: {
      readonly userId: string;
    },
  ) {}
}

export type GetUserQueryData = GetUserQuery['data'];

export type GetUserQueryReturnType = Omit<User, 'password'>;
